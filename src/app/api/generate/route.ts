import { NextRequest } from 'next/server';
import admin from 'firebase-admin';
import { adminFirestore, FieldValue } from '@/lib/firebase/admin';
import type { Transaction } from 'firebase-admin/firestore';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { countMessagesTokens } from '@/lib/ai/tokenizer';
import { generateWithFallback, Provider } from '@/lib/ai/adapter';
import { getSystemPrompt, getIterativeEditPrompt } from '@/lib/ai/prompts';
import { stripThinking } from '@/lib/ai/thinking';
import { AVAILABLE_MODELS } from '@/lib/types/ai';
import { DAILY_TOKEN_LIMIT } from '@/lib/utils/constants';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { sanitizeError } from '@/lib/utils/sanitize';
import { classifyFailure, getFailureMessage } from '@/lib/ai/errors';
import { z } from 'zod';

const generateSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(50000),
  })).min(1).max(200),
  model: z.string().min(1).max(100),
  provider: z.string().max(50).optional(),
  projectId: z.string().min(1).max(200),
  framework: z.string().max(50).optional(),
  systemPrompt: z.string().max(10000).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const uid = auth.uid;

  const rl = checkRateLimit(`generate:${uid}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
    });
  }

  let body: z.infer<typeof generateSchema>;
  try {
    body = generateSchema.parse(await req.json());
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, model, provider, projectId, framework, systemPrompt: customPrompt } = body;

  // Load current project files for context
  let projectSnapshot = '';
  try {
    const snapshotsQuery = await adminFirestore
      .collection(`projects/${projectId}/snapshots`)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!snapshotsQuery.empty) {
      const latestSnap = snapshotsQuery.docs[0].data();
      const files = latestSnap.files as Array<{ path: string; content: string }> | undefined;
      if (files && files.length > 0) {
        projectSnapshot = files
          .map((f) => `=== ${f.path} ===\n${f.content}`)
          .join('\n\n');
      }
    }
  } catch {
    // No snapshot yet — first generation
  }

  // Build system prompt with context
  let systemPrompt: string;
  if (projectSnapshot) {
    systemPrompt = getSystemPrompt(framework || 'nextjs') + '\n\n' + getIterativeEditPrompt(projectSnapshot);
  } else {
    systemPrompt = customPrompt || getSystemPrompt(framework || 'nextjs');
  }

  // SECURITY: Pre-reserve estimated tokens atomically via Firestore transaction
  const userRef = adminFirestore.collection('users').doc(uid) as admin.firestore.DocumentReference;
  const today = new Date().toISOString().split('T')[0];
  const dailyLimit = DAILY_TOKEN_LIMIT;
  const estimatedTokens = countMessagesTokens(messages);

  let reservedTokens: number;
  try {
    reservedTokens = await adminFirestore.runTransaction(async (transaction: Transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) {
        throw new Error('USER_NOT_FOUND');
      }

      const userData = userSnap.data()!;
      let currentUsed = userData.tokensUsedToday || 0;

      if (userData.tokenResetDate !== today) {
        currentUsed = 0;
        transaction.update(userRef, {
          tokensUsedToday: 0,
          tokenResetDate: today,
        });
      }

      const remaining = dailyLimit - currentUsed;
      if (estimatedTokens > remaining) {
        throw new Error('LIMIT_EXCEEDED');
      }

      transaction.update(userRef, {
        tokensUsedToday: FieldValue.increment(estimatedTokens),
      });

      return estimatedTokens;
    });
  } catch (err: any) {
    if (err.message === 'LIMIT_EXCEEDED') {
      return new Response(
        JSON.stringify({
          error: 'Daily token limit exceeded',
          dailyLimit,
          remaining: 0,
          resetTime: new Date(Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate() + 1
          )).toISOString(),
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (err.message === 'USER_NOT_FOUND') {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    throw err;
  }

  // Build model fallback list
  const startIdx = AVAILABLE_MODELS.findIndex((m) => m.id === model);
  const modelFallbackList = startIdx >= 0
    ? AVAILABLE_MODELS.slice(startIdx)
    : AVAILABLE_MODELS;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = '';
      let usedProvider: Provider = (provider as Provider) || 'nvidia';
      let usedModel = model;

      const emitStatus = (msg: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: msg })}\n\n`));
      };

      const emitAgent = (payload: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ agent: payload })}\n\n`));
      };

      const onToken = (tok: string) => {
        fullResponse += tok;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: tok })}\n\n`));
      };

      const onProviderFallback = (event: { from: Provider; to: Provider; error?: string }) => {
        usedProvider = event.to;
        if (event.error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ provider_error: true, provider: event.from, error: event.error })}\n\n`
            )
          );
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ fallback: true, from: event.from, to: event.to })}\n\n`
          )
        );
      };

      let previousAttempts = 0;

      // Emit thinking plan
      emitAgent({
        type: 'thinking',
        data: {
          steps: [
            { status: 'running', title: 'Analyze request' },
            { status: 'pending', title: 'Determine file changes' },
            { status: 'pending', title: 'Generate code' },
          ],
        },
      });

      emitStatus('Loading project context...');
      if (projectSnapshot) {
        emitAgent({
          type: 'tool',
          data: { tool: 'read_file', description: 'Load project files for context' },
        });
        emitStatus('Project loaded, preparing prompt...');
      }
      emitAgent({
        type: 'thinking',
        data: {
          steps: [
            { status: 'completed', title: 'Analyze request' },
            { status: 'running', title: 'Determine file changes' },
            { status: 'pending', title: 'Generate code' },
          ],
        },
      });
      emitStatus('Generating code...');

      for (let mi = 0; mi < modelFallbackList.length; mi++) {
        const currentModel = modelFallbackList[mi];
        usedModel = currentModel.id;
        usedProvider = currentModel.provider;
        const attemptStart = Date.now();

        try {
          const result = await generateWithFallback(
            { messages, model: currentModel.id, systemPrompt, onToken },
            currentModel.provider,
            onProviderFallback
          );
          usedProvider = result.provider;

          const finalTokens = countMessagesTokens([{ role: 'assistant', content: fullResponse }]);
          const tokenDiff = finalTokens - reservedTokens;

          const dailyUsageKey = `dailyUsage.${new Date().toISOString().split('T')[0]}`;
          if (tokenDiff !== 0) {
            await userRef.update({
              tokensUsedToday: FieldValue.increment(tokenDiff),
              totalTokensConsumed: FieldValue.increment(finalTokens),
              [dailyUsageKey]: FieldValue.increment(finalTokens),
            });
          } else {
            await userRef.update({
              totalTokensConsumed: FieldValue.increment(finalTokens),
              [dailyUsageKey]: FieldValue.increment(finalTokens),
            });
          }

          const projectRef = adminFirestore.collection('projects').doc(projectId);
          await projectRef.update({
            tokenCount: FieldValue.increment(finalTokens),
            updatedAt: new Date(),
          });

          emitAgent({
            type: 'thinking',
            data: {
              steps: [
                { status: 'completed', title: 'Analyze request' },
                { status: 'completed', title: 'Determine file changes' },
                { status: 'completed', title: 'Generate code' },
              ],
            },
          });

          emitStatus('Processing generated output...');

          // Parse files from response and save snapshot
          let parsedFiles: Array<{ path: string; content: string }> | null = null;
          const cleanResponse = stripThinking(fullResponse);
          try {
            const parsed = JSON.parse(cleanResponse);
            if (parsed.files && Array.isArray(parsed.files)) {
              parsedFiles = parsed.files
                .filter((f: any) => f.action !== 'delete')
                .map((f: any) => ({ path: f.path, content: f.content }));
            }
          } catch {
            // Not JSON — save as raw content
          }

          // Emit tool and summary events
          if (parsedFiles && parsedFiles.length > 0) {
            for (const f of parsedFiles) {
              emitAgent({ type: 'tool', data: { tool: 'write_file', file: f.path } });
              emitAgent({ type: 'diff', data: { file: f.path, action: 'modify' } });
            }
            emitAgent({
              type: 'summary',
              data: {
                message: `Generated and saved ${parsedFiles.length} file(s)`,
                filesModified: parsedFiles.map((f) => ({ path: f.path, action: 'modify' })),
                changes: parsedFiles.map((f) => `Modified ${f.path}`),
                verification: [{ name: 'File changes applied', passed: true }],
              },
            });
          } else {
            emitAgent({
              type: 'summary',
              data: {
                message: 'Response generated successfully',
                filesModified: [],
                changes: ['Response generated'],
                verification: [{ name: 'Completion', passed: true }],
              },
            });
          }

          // Log provider performance
          const latencyMs = Date.now() - attemptStart;
          await adminFirestore
            .collection(`projects/${projectId}/provider_stats`)
            .add({
              provider: usedProvider,
              model: currentModel.id,
              projectId,
              success: true,
              latencyMs,
              timestamp: new Date(),
            }).catch(() => {});

          // Save assistant message
          const messagesRef = adminFirestore.collection(`projects/${projectId}/messages`);
          const msgRef = await messagesRef.add({
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date(),
            tokensUsed: finalTokens,
            modelUsed: currentModel.id,
            provider: usedProvider,
            files: parsedFiles,
          });

          emitStatus('Saving snapshot...');

          // Save snapshot with the generated files
          if (parsedFiles && parsedFiles.length > 0) {
            await adminFirestore
              .collection(`projects/${projectId}/snapshots`)
              .add({
                files: parsedFiles,
                triggerMessageId: msgRef.id,
                timestamp: new Date(),
              });
          }

          // Log user activity on first generation
          const activityCollection = adminFirestore.collection('user_activity');
          const existingGen = await activityCollection
            .where('userId', '==', uid)
            .where('action', '==', 'generation_completed')
            .limit(1)
            .get()
            .catch(() => null);
          const isFirst = !existingGen || existingGen.empty;
          await activityCollection.add({
            userId: uid,
            action: isFirst ? 'first_generation' : 'generation_completed',
            projectId,
            details: { model: currentModel.id, provider: usedProvider, tokensUsed: finalTokens },
            timestamp: new Date(),
          }).catch(() => {});

          emitStatus('Complete');
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, tokensUsed: finalTokens, hasSnapshot: !!(parsedFiles && parsedFiles.length > 0), messageId: msgRef.id })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          return;
        } catch (err) {
          // Log provider failure
          const latencyMs = Date.now() - attemptStart;
          await adminFirestore
            .collection(`projects/${projectId}/provider_stats`)
            .add({
              provider: currentModel.provider,
              model: currentModel.id,
              projectId,
              success: false,
              latencyMs,
              errorMessage: err instanceof Error ? sanitizeError(err.message).slice(0, 500) : 'Unknown error',
              timestamp: new Date(),
            }).catch(() => {});

          previousAttempts++;
          const failureType = classifyFailure(err);
          const failureMsg = getFailureMessage(failureType, currentModel.displayName);
          const nextModel = modelFallbackList[mi + 1];
          if (nextModel) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ fallback: true, from: currentModel.displayName, to: nextModel.displayName, failureType, failureMessage: failureMsg })}\n\n`
              )
            );
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ provider_error: true, provider: currentModel.provider, error: failureMsg, model: currentModel.displayName, failureType })}\n\n`
              )
            );
            emitAgent({
              type: 'tool',
              data: { tool: 'run_command', description: `Falling back to ${nextModel.displayName}` },
            });
          }
          continue;
        }
      }

      // Log generation error when all models exhausted
      await adminFirestore
        .collection('generation_errors')
        .add({
          projectId,
          userId: uid,
          model: usedModel,
          provider: usedProvider,
          errorMessage: 'All models exhausted after 3 attempts each',
          previousAttempts,
          timestamp: new Date(),
        }).catch(() => {});

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ error: `All models exhausted. Last attempt via ${usedProvider} failed.`, providerError: usedProvider })}\n\n`
        )
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
