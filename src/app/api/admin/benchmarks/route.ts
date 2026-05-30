import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { isAdminEmail } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;

  const rl = checkRateLimit(`admin-benchmarks:${auth.uid}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const userRecord = await adminAuth.getUser(auth.uid);
    if (!userRecord.customClaims?.admin && !isAdminEmail(auth.email)) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayStart = new Date(todayStr);

    const messagesSnap = await adminFirestore
      .collectionGroup('messages')
      .where('timestamp', '>=', todayStart)
      .where('role', '==', 'assistant')
      .get();

    const statsMap = new Map<string, { latencies: number[]; tokens: number[]; totalCalls: number; errors: number }>();

    for (const doc of messagesSnap.docs) {
      const data = doc.data();
      const provider = data.provider || 'unknown';
      const model = data.modelUsed || 'unknown';
      const key = `${provider}:${model}`;

      if (!statsMap.has(key)) {
        statsMap.set(key, { latencies: [], tokens: [], totalCalls: 0, errors: 0 });
      }

      const stat = statsMap.get(key)!;
      stat.totalCalls++;
      if (data.tokensUsed) stat.tokens.push(data.tokensUsed);
      if (data.latencyMs) stat.latencies.push(data.latencyMs);
      if (data.error) stat.errors++;
    }

    const stats = Array.from(statsMap.entries()).map(([key, s]) => {
      const [provider, model] = key.split(':');
      return {
        provider,
        model,
        totalCalls: s.totalCalls,
        avgLatency: s.latencies.length > 0 ? s.latencies.reduce((a, b) => a + b, 0) / s.latencies.length : 0,
        avgTokens: s.tokens.length > 0 ? s.tokens.reduce((a, b) => a + b, 0) / s.tokens.length : 0,
        successRate: s.totalCalls > 0 ? (s.totalCalls - s.errors) / s.totalCalls : 1,
        errorCount: s.errors,
      };
    });

    return NextResponse.json({ stats, date: todayStr });
  } catch (err) {
    console.error('[AdminBenchmarks] Failed to fetch benchmarks:', err);
    return NextResponse.json({ error: 'Failed to fetch benchmarks' }, { status: 500 });
  }
}
