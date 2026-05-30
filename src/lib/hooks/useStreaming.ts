'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useEditorStore, FileDiff } from '@/lib/store/useEditorStore';
import { StreamEvent, AIFileChange, AVAILABLE_MODELS, AIModel, AgentEventPayload } from '@/lib/types/ai';
import { MODEL_TIMEOUT_MS, FALLBACK_NOTIFICATION_SECONDS, FALLBACK_TIMEOUT_MS } from '@/lib/utils/constants';
import { getSystemPrompt, getJsonRepairPrompt } from '@/lib/ai/prompts';
import { stripThinking } from '@/lib/ai/thinking';
import { classifyFailure, getFailureMessage } from '@/lib/ai/errors';
import { getNextFallbackModel, getFallbackModelChain } from '@/lib/ai/fallback-chain';
import { modelHealth } from '@/lib/ai/model-health';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type ProgressPhase = 'idle' | 'sending' | 'generating' | 'parsing' | 'repairing' | 'complete' | 'error';

export interface FileChangeSummary {
  created: string[];
  modified: string[];
  deleted: string[];
  summary?: string;
  descriptions?: Record<string, string>;
}

export function useStreaming() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [fallbackInfo, setFallbackInfo] = useState<{ from: string; to: string } | null>(null);
  const [fallbackCountdown, setFallbackCountdown] = useState<number>(0);
  const [fallbackCountdownActive, setFallbackCountdownActive] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string>('');
  const [fallbackFromModel, setFallbackFromModel] = useState<string>('');
  const [fallbackToModel, setFallbackToModel] = useState<string>('');
  const [providerErrors, setProviderErrors] = useState<string[]>([]);
  const [progressPhase, setProgressPhase] = useState<ProgressPhase>('idle');
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [fileChangeSummary, setFileChangeSummary] = useState<FileChangeSummary | null>(null);
  const [agentEvents, setAgentEvents] = useState<AgentEventPayload[]>([]);
  const [partialOutputCount, setPartialOutputCount] = useState<number>(0);
  const idToken = useAuthStore((s) => s.idToken);
  const currentProject = useProjectStore((s) => s.currentProject);
  const storeMessages = useProjectStore((s) => s.messages);
  const addMessage = useProjectStore((s) => s.addMessage);
  const setFiles = useProjectStore((s) => s.setFiles);
  const files = useProjectStore((s) => s.files);
  const abortRef = useRef<AbortController | null>(null);

  // Track pre-AI file state for revert
  const preAiFilesRef = useRef<Map<string, string> | null>(null);
  const preAiMessagesRef = useRef<Message[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const receivedAnyTokenRef = useRef(false);
  const fallbackModelChainRef = useRef<AIModel[]>([]);
  const currentFallbackIndexRef = useRef(0);
  const partialOutputRef = useRef<string>('');
  const pendingRequestRef = useRef<{
    content: string;
    action?: 'improve' | 'refactor' | 'fix';
  } | null>(null);
  const countdownResolveRef = useRef<((value: boolean) => void) | null>(null);

  // Load existing messages from Firestore on mount
  useEffect(() => {
    if (storeMessages.length > 0 && messages.length === 0) {
      setMessages(
        storeMessages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      );
      // Restore latest agent events from the last assistant message
      const lastAssistant = [...storeMessages].reverse().find((m) => m.role === 'assistant' && m.agentEvents && m.agentEvents.length > 0);
      if (lastAssistant?.agentEvents) {
        setAgentEvents(lastAssistant.agentEvents as AgentEventPayload[]);
      }
    }
  }, [storeMessages, messages.length]);

  // Helper: extract JSON from AI output (handles markdown code fences)
  const extractJson = (text: string): string => {
    // Strip thinking/reasoning blocks before extracting JSON
    const cleaned = stripThinking(text);
    // Try to extract from markdown code block first
    const jsonBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlock) return jsonBlock[1].trim();

    // Try to find a JSON object directly
    const braceMatch = cleaned.match(/\{[\s\S]*\}/);
    if (braceMatch) return braceMatch[0];

    return cleaned.trim();
  };

  // Helper: safely parse JSON with common repairs
  const tryParseJson = (text: string): any => {
    const extracted = extractJson(text);
    try {
      return JSON.parse(extracted);
    } catch {
      // Try common repairs
      let repaired = extracted
        .replace(/,\s*([}\]])/g, '$1')                 // trailing commas
        .replace(/'/g, '"')                              // single quotes to double
        .replace(/(\w+):/g, '"$1":')                     // unquoted keys
        .replace(/\/\/.*$/gm, '')                        // single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '');               // multi-line comments
      try {
        return JSON.parse(repaired);
      } catch {
        // Try prepending { if missing
        if (!repaired.trim().startsWith('{')) {
          try {
            return JSON.parse('{' + repaired.trim() + '}');
          } catch {}
        }
        return null;
      }
    }
  };

  const buildAgentEvents = (
    parsed: any,
    diffs: FileDiff[],
    summary: string,
    changes: FileChangeSummary
  ): AgentEventPayload[] => {
    const events: AgentEventPayload[] = [];

    // 1. Thinking phase
    const steps = [
      { status: 'completed' as const, title: 'Analyze request' },
    ];

    if (changes.created.length > 0 || changes.modified.length > 0 || changes.deleted.length > 0) {
      steps.push({ status: 'completed' as const, title: 'Determine file changes' });
    }
    steps.push({ status: 'completed' as const, title: 'Generate code' });

    events.push({ type: 'thinking', data: { steps } });

    // 2. Tool calls + diffs
    if (changes.created.length > 0) {
      for (const path of changes.created) {
        events.push({
          type: 'tool',
          data: { tool: 'create_file', file: path, description: changes.descriptions?.[path] },
        });
      }
    }
    if (changes.modified.length > 0) {
      for (const path of changes.modified) {
        const diff = diffs.find((d) => d.filename === path);
        events.push({
          type: 'tool',
          data: { tool: 'edit_file', file: path, description: changes.descriptions?.[path] },
        });
        if (diff) {
          events.push({
            type: 'diff',
            data: {
              file: path,
              oldContent: diff.oldContent,
              newContent: diff.newContent,
              action: 'modify',
            },
          });
        }
      }
    }
    if (changes.created.length > 0) {
      for (const path of changes.created) {
        const diff = diffs.find((d) => d.filename === path);
        if (diff) {
          events.push({
            type: 'diff',
            data: {
              file: path,
              oldContent: diff.oldContent,
              newContent: diff.newContent,
              action: 'create',
            },
          });
        }
      }
    }
    if (changes.deleted.length > 0) {
      for (const path of changes.deleted) {
        events.push({
          type: 'diff',
          data: { file: path, oldContent: '', newContent: '', action: 'delete' },
        });
      }
    }

    // 3. Summary
    const allFiles = [
      ...changes.created.map((p) => ({ path: p, action: 'create' as const })),
      ...changes.modified.map((p) => ({ path: p, action: 'modify' as const })),
      ...changes.deleted.map((p) => ({ path: p, action: 'delete' as const })),
    ];

    events.push({
      type: 'summary',
      data: {
        message: summary || `Modified ${allFiles.length} file(s)`,
        filesModified: allFiles,
        changes: [
          ...changes.created.map((p) => `Created ${p}`),
          ...changes.modified.map((p) => `Modified ${p}`),
          ...changes.deleted.map((p) => `Deleted ${p}`),
        ],
        verification: [
          { name: 'File changes applied', passed: true },
        ],
      },
    });

    return events;
  };

  const sendMessage = useCallback(
    async (content: string, action?: 'improve' | 'refactor' | 'fix') => {
      if (!idToken || !currentProject) return;
      setProviderErrors([]);
      setFileChangeSummary(null);
      setAgentEvents([]);
      useEditorStore.getState().setStreaming(true);
      setProgressPhase('sending');

      // Build user content: prepend screenshots if any
      const { pendingScreenshots, customInstructions, projectMemory, planMode } = useEditorStore.getState();
      let userContent = action ? `${action}: ${content}` : content;
      if (pendingScreenshots.length > 0) {
        const screenshotBlock = pendingScreenshots.map((s, i) => `![Screenshot ${i + 1}](${s})`).join('\n');
        userContent = `${screenshotBlock}\n\n${userContent}`;
        useEditorStore.getState().clearScreenshots();
      }

      const userMsg: Message = { role: 'user', content: userContent };
      setMessages((prev) => [...prev, userMsg]);
      const selectedModel = AVAILABLE_MODELS.find((m) => m.id === currentProject.selectedModel);
      const provider = selectedModel?.provider || 'nvidia';

      await addMessage(currentProject.id, {
        role: 'user',
        content: userMsg.content,
        timestamp: new Date(),
        tokensUsed: 0,
        modelUsed: currentProject.selectedModel,
        provider,
        files: null,
      });

      // Save pre-AI file state for revert
      preAiFilesRef.current = new Map(files);
      preAiMessagesRef.current = [...messages];

      pendingRequestRef.current = { content, action };

      // Initialize fallback chain from current model
      if (!action) {
        fallbackModelChainRef.current = getFallbackModelChain(
          currentProject.selectedModel,
          modelHealth.getAvailableModels(AVAILABLE_MODELS)
        );
        currentFallbackIndexRef.current = 0;
      }

      abortRef.current = new AbortController();
      let assistantContent = partialOutputRef.current || '';
      let fallbackTimer: NodeJS.Timeout | null = null;
      let streamError: string | null = null;
      let retryCount = 0;
      const MAX_RETRIES = 1;
      receivedAnyTokenRef.current = false;
      if (!assistantContent) {
        partialOutputRef.current = '';
      }

      // Build system prompt override with custom instructions + project memory
      const buildSystemPrompt = () => {
        let prompt = '';
        if (customInstructions) {
          prompt += `## Custom Instructions\n${customInstructions}\n\n`;
        }
        if (projectMemory) {
          prompt += `## Project Memory\n${projectMemory}\n\n`;
        }
        return prompt || undefined;
      };

      const doFetch = async (overrideMessages?: Message[], overrideSystemPrompt?: string) => {
        const msgs = overrideMessages || [...messages, userMsg];
        const body: Record<string, any> = {
          projectId: currentProject.id,
          messages: msgs,
          model: currentProject.selectedModel,
          provider,
          framework: currentProject.framework,
        };
        const promptOverride = overrideSystemPrompt || buildSystemPrompt();
        if (promptOverride) body.systemPrompt = promptOverride;

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: abortRef.current!.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Generation failed');
        }

        return response;
      };

      try {
        let response = await doFetch();

        setProgressPhase('generating');
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');
        const decoder = new TextDecoder();
        receivedAnyTokenRef.current = false;

        // Start timeout timer
        resetTimeoutTimer();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

          for (const line of lines) {
            const raw = line.slice(6);
            if (raw === '[DONE]') continue;

            let event: StreamEvent;
            try {
              event = JSON.parse(raw);
            } catch {
              continue;
            }

            if (event.token) {
              receivedAnyTokenRef.current = true;
              assistantContent += event.token;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return [...prev.slice(0, -1), { role: 'assistant', content: assistantContent }];
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }

            if (event.status) {
              setProgressStatus(event.status);
              if (event.status === 'Generating code...') setProgressPhase('generating');
              else if (event.status === 'Processing generated output...') setProgressPhase('parsing');
              else if (event.status === 'Saving snapshot...') setProgressPhase('parsing');
              else if (event.status === 'Complete') setProgressPhase('complete');
              else if (event.status.startsWith('Loading')) setProgressPhase('sending');
            }

            if (event.provider_error) {
              setProviderErrors((prev) => [...prev, event.error || 'Unknown provider error']);
            }

            if (event.fallback) {
              const fallbackEvt = { from: event.from || 'unknown', to: event.to || 'unknown' };
              setFallbackInfo(fallbackEvt);
              if (fallbackTimer) clearTimeout(fallbackTimer);
              fallbackTimer = setTimeout(() => setFallbackInfo(null), FALLBACK_TIMEOUT_MS);
            }

            const agentPayload = event.agent;
            if (agentPayload) {
              setAgentEvents((prev) => {
                if (agentPayload.type === 'thinking') {
                  const filtered = prev.filter((e) => e.type !== 'thinking');
                  return [...filtered, agentPayload];
                }
                return [...prev, agentPayload];
              });
            }

            if (event.error) {
              streamError = event.error;
              break;
            }
          }

          if (streamError) break;
        }

        setProgressPhase('parsing');

        if (streamError) throw new Error(streamError);

        // Try to parse JSON from the AI output
        let parsed: any = null;
        try {
          parsed = tryParseJson(assistantContent);
        } catch {
          // Will retry below
        }

        // If JSON parsing failed, retry with repair prompt
        if (!parsed && retryCount < MAX_RETRIES) {
          retryCount++;
          setProgressPhase('repairing');
          const repairPrompt = getJsonRepairPrompt('Failed to parse JSON output', assistantContent);
          const retryMessages = [...messages, userMsg, { role: 'assistant' as const, content: assistantContent }, { role: 'user' as const, content: repairPrompt }];

          // Clear the failed content
          assistantContent = '';
          setMessages((prev) => {
            const withoutFailed = prev.slice(0, -1); // remove the failed assistant message
            return [...withoutFailed, { role: 'assistant', content: 'Repairing JSON output...' }];
          });

          response = await doFetch(retryMessages);

          const retryReader = response.body?.getReader();
          if (!retryReader) throw new Error('No response stream');

          while (true) {
            const { done, value } = await retryReader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
            for (const line of lines) {
              const raw = line.slice(6);
              if (raw === '[DONE]') continue;
              try {
                const event: StreamEvent = JSON.parse(raw);
                if (event.token) {
                  assistantContent += event.token;
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last?.role === 'assistant') {
                      return [...prev.slice(0, -1), { role: 'assistant', content: assistantContent }];
                    }
                    return [...prev, { role: 'assistant', content: assistantContent }];
                  });
                }
                if (event.status) {
                  setProgressStatus(event.status);
                }
                if (event.error) { streamError = event.error; break; }
              } catch {}
            }
            if (streamError) break;
          }

          if (streamError) throw new Error(streamError);
          parsed = tryParseJson(assistantContent);
        }

        // Apply file changes and compute diffs
        let msgId: string | null = null;
        let agentEvts: AgentEventPayload[] = [];

        if (parsed && parsed.files && Array.isArray(parsed.files)) {
          const changes = parsed.files as AIFileChange[];
          const preFiles = preAiFilesRef.current || new Map();
          const newFiles = new Map(preFiles);
          const diffs: FileDiff[] = [];
          const created: string[] = [];
          const modified: string[] = [];
          const deleted: string[] = [];
          const descriptions: Record<string, string> = {};

          for (const change of changes) {
            if (change.description) {
              descriptions[change.path] = change.description;
            }
            if (change.action === 'delete') {
              const oldContent = preFiles.get(change.path) || '';
              diffs.push({ filename: change.path, oldContent, newContent: '', status: 'pending' });
              newFiles.delete(change.path);
              deleted.push(change.path);
            } else if (change.action === 'create') {
              const oldContent = preFiles.get(change.path) || '';
              diffs.push({ filename: change.path, oldContent, newContent: change.content, status: 'pending' });
              newFiles.set(change.path, change.content);
              created.push(change.path);
            } else {
              const oldContent = preFiles.get(change.path) || '';
              diffs.push({ filename: change.path, oldContent, newContent: change.content, status: 'pending' });
              newFiles.set(change.path, change.content);
              modified.push(change.path);
            }
          }

          const changeSummary: FileChangeSummary = {
            created,
            modified,
            deleted,
            summary: parsed.summary || undefined,
            descriptions,
          };
          setFileChangeSummary(changeSummary);

          agentEvts = buildAgentEvents(parsed, diffs, parsed.summary || '', changeSummary);
          setAgentEvents(agentEvts);

          // Save assistant message with agent events
          msgId = await addMessage(currentProject.id, {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
            tokensUsed: 0,
            modelUsed: currentProject.selectedModel,
            provider,
            files: parsed?.files?.filter((f: AIFileChange) => f.action !== 'delete').map((f: AIFileChange) => ({ path: f.path, content: f.content })) || null,
            agentEvents: agentEvts,
          });

          if (diffs.length > 0) {
            useEditorStore.getState().setPendingDiffs(diffs, msgId, currentProject?.id, preFiles, newFiles);
            useEditorStore.getState().setShowDiffPanel(true);
          }
          // In plan mode, don't auto-apply — wait for user to accept/reject
          if (!planMode) {
            setFiles(newFiles);
          }
        } else if (parsed && !parsed.files) {
          // Build minimal agent events for text output
          agentEvts = [
            { type: 'thinking', data: { steps: [{ status: 'completed', title: 'Generate response' }] } },
            { type: 'summary', data: { message: assistantContent.slice(0, 120), filesModified: [], changes: ['Response generated'], verification: [] } },
          ];
          setAgentEvents(agentEvts);

          msgId = await addMessage(currentProject.id, {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
            tokensUsed: 0,
            modelUsed: currentProject.selectedModel,
            provider,
            files: null,
            agentEvents: agentEvts,
          });
          setFileChangeSummary(null);
        } else {
          msgId = await addMessage(currentProject.id, {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
            tokensUsed: 0,
            modelUsed: currentProject.selectedModel,
            provider,
            files: null,
            agentEvents: [],
          });
        }

        // Create checkpoint for rewind
        useEditorStore.getState().addCheckpoint(
          assistantContent.slice(0, 80),
          preAiFilesRef.current || new Map(),
          preAiMessagesRef.current,
          msgId || ''
        );
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // AbortError means either user cancelled or timeout triggered
          // If timeout triggered, fallback is handled by timeout handler
          return;
        }
        setProgressPhase('error');
        modelHealth.recordFailure(currentProject.selectedModel);
        // Store partial output for potential retry
        if (assistantContent) {
          partialOutputRef.current = assistantContent;
        }
        // On error, revert to pre-AI state
        store.revertToPreAi();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${err.message}` },
        ]);
      } finally {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        clearTimeoutTimer();
        setProgressPhase((p) => p === 'error' ? 'error' : 'complete');
        modelHealth.recordSuccess(currentProject.selectedModel);
        partialOutputRef.current = '';
        pendingRequestRef.current = null;
        useEditorStore.getState().setStreaming(false);
        abortRef.current = null;
        preAiFilesRef.current = null;
      }
    },
    [idToken, currentProject, messages, files, addMessage, setFiles]
  );

  const clearTimeoutTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    clearTimeoutTimer();
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setProgressPhase('idle');
    setProgressStatus('');
    setFallbackCountdownActive(false);
    setFallbackCountdown(0);
    setPartialOutputCount(0);
    setAgentEvents([]);
    partialOutputRef.current = '';
    store.revertToPreAi();
    setMessages(preAiMessagesRef.current);
  }, [clearTimeoutTimer]);

  const resetTimeoutTimer = useCallback(() => {
    clearTimeoutTimer();
    timeoutRef.current = setTimeout(() => {
      if (abortRef.current) {
        abortRef.current.abort();
        modelHealth.recordFailure(currentProject?.selectedModel || 'unknown');
        const modelLabel = currentProject?.selectedModel || 'Current model';
        setFallbackReason(`${modelLabel} is taking too long.`);
        startFallbackCountdown();
      }
    }, MODEL_TIMEOUT_MS);
  }, [currentProject?.selectedModel]);

  const startFallbackCountdown = useCallback(() => {
    setFallbackCountdownActive(true);
    setFallbackCountdown(FALLBACK_NOTIFICATION_SECONDS);

    const { fromModel, toModel } = getFallbackModelLabels();
    if (fromModel) setFallbackFromModel(fromModel);
    if (toModel) setFallbackToModel(toModel);

    let remaining = FALLBACK_NOTIFICATION_SECONDS;
    countdownRef.current = setInterval(() => {
      remaining--;
      setFallbackCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        setFallbackCountdownActive(false);
        executeFallback();
      }
    }, 1000);
  }, []);

  const getFallbackModelLabels = useCallback((): { fromModel: string; toModel: string } => {
    const chain = fallbackModelChainRef.current;
    const idx = currentFallbackIndexRef.current;
    const from = chain[idx]?.displayName || currentProject?.selectedModel || 'Current model';
    const to = chain[idx + 1]?.displayName || 'backup model';
    return { fromModel: from, toModel: to };
  }, [currentProject?.selectedModel]);

  const switchNow = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setFallbackCountdownActive(false);
    executeFallback();
  }, []);

  const executeFallback = useCallback(() => {
    clearTimeoutTimer();
    setFallbackCountdownActive(false);

    currentFallbackIndexRef.current++;
    const chain = fallbackModelChainRef.current;
    const nextIdx = currentFallbackIndexRef.current;

    if (nextIdx >= chain.length) {
      setProgressPhase('error');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error: All models exhausted. Please try again later.' },
      ]);
      useEditorStore.getState().setStreaming(false);
      return;
    }

    const pending = pendingRequestRef.current;
    if (!pending) return;

    const partialContent = partialOutputRef.current;
    const originalMessages = preAiMessagesRef.current;

    if (partialContent) {
      setProgressStatus(`Response interrupted. Switching to ${chain[nextIdx].displayName}...`);
      setPartialOutputCount(partialContent.length);
    } else {
      setProgressStatus(`Switching to ${chain[nextIdx].displayName}...`);
    }

    setFallbackInfo({ from: chain[nextIdx - 1]?.displayName || 'unknown', to: chain[nextIdx].displayName });

    sendMessage(pending.content, pending.action);
  }, []);

  const clearGeneration = useCallback(() => {
    setProgressPhase('idle');
    setProgressStatus('');
    setFileChangeSummary(null);
    setAgentEvents([]);
    setProviderErrors([]);
    setFallbackInfo(null);
    setFallbackCountdownActive(false);
    setFallbackCountdown(0);
    setPartialOutputCount(0);
    clearTimeoutTimer();
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [clearTimeoutTimer]);

  const clearProviderErrors = useCallback(() => {
    setProviderErrors([]);
  }, []);

  const acceptFallback = useCallback(() => {
    clearTimeoutTimer();
    setFallbackInfo(null);
    setFallbackCountdownActive(false);
    setFallbackCountdown(0);
  }, [clearTimeoutTimer]);

  const revertFallback = useCallback(() => {
    clearTimeoutTimer();
    setFallbackInfo(null);
    setFallbackCountdownActive(false);
    setFallbackCountdown(0);
    setPartialOutputCount(0);
    partialOutputRef.current = '';
    store.revertToPreAi();
  }, [clearTimeoutTimer]);

  const store = {
    revertToPreAi: () => {
      if (preAiFilesRef.current) {
        setFiles(preAiFilesRef.current);
        useEditorStore.getState().setPendingDiffs([]);
        useEditorStore.getState().setShowDiffPanel(false);
      }
    },
  };

  const isStreaming = useEditorStore((s) => s.isStreaming);

  return {
    messages,
    isStreaming,
    fallbackInfo,
    fallbackCountdown,
    fallbackCountdownActive,
    fallbackReason,
    fallbackFromModel,
    fallbackToModel,
    partialOutputCount,
    providerErrors,
    progressPhase,
    progressStatus,
    fileChangeSummary,
    agentEvents,
    sendMessage,
    cancelStream,
    switchNow,
    acceptFallback,
    revertFallback,
    clearProviderErrors,
    clearGeneration,
  };
}
