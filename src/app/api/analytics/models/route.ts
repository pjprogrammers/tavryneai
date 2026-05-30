import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';
import type { ModelUsage } from '@/lib/types/analytics';

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`analytics:${auth.uid}`, { maxTokens: 30, refillRate: 1, refillIntervalMs: 2000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const uid = auth.uid;

    // 1. Get user's active project IDs
    const projectsSnap = await adminFirestore
      .collection('projects')
      .where('userId', '==', uid)
      .get();

    const projectIds: string[] = projectsSnap.docs
      .filter((d: any) => d.data().status !== 'deleted')
      .map((d: any) => d.id as string);

    // 2. Fetch all assistant messages (no date filter — need lifetime totals)
    const messageQueries = projectIds.map((pid: string) =>
      adminFirestore
        .collection(`projects/${pid}/messages`)
        .where('role', '==', 'assistant')
        .get()
    );

    const messageSnaps = await Promise.all(messageQueries);

    // 3. Aggregate tokens per model
    const modelTotals = new Map<string, { tokens: number; provider: string }>();
    let grandTotal = 0;

    for (const snap of messageSnaps) {
      for (const doc of snap.docs) {
        const data = doc.data();
        const tokens = data.tokensUsed || 0;
        const model = data.modelUsed || 'unknown';
        const provider = data.provider || 'unknown';

        const existing = modelTotals.get(model) || { tokens: 0, provider };
        existing.tokens += tokens;
        modelTotals.set(model, existing);
        grandTotal += tokens;
      }
    }

    // 4. Convert to sorted array with percentages
    const modelUsage: ModelUsage[] = Array.from(modelTotals.entries())
      .map(([model, { tokens, provider }]) => ({
        model,
        provider,
        tokens,
        pct: grandTotal > 0 ? Math.round((tokens / grandTotal) * 100) : 0,
      }))
      .sort((a, b) => b.tokens - a.tokens);

    return NextResponse.json(modelUsage);
  } catch (err) {
    console.error('[Analytics/Models] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch model distribution' }, { status: 500 });
  }
}
