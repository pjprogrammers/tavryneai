import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { adminFirestore } from '@/lib/firebase/admin';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { DAILY_TOKEN_LIMIT } from '@/lib/utils/constants';

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`usage:${auth.uid}`, { maxTokens: 30, refillRate: 1, refillIntervalMs: 2000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const userRef = adminFirestore.collection('users').doc(auth.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data()!;
    const dailyLimit = DAILY_TOKEN_LIMIT;
    const tokensUsedToday = userData.tokensUsedToday || 0;
    const remaining = Math.max(0, dailyLimit - tokensUsedToday);

    const now = new Date();
    const resetTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    return NextResponse.json({
      tokensUsedToday,
      dailyLimit,
      remaining,
      resetTime: resetTime.toISOString(),
    });
  } catch (err) {
    console.error('[API] GET /api/user/usage failed:', err);
    return NextResponse.json({ error: 'Failed to load usage data' }, { status: 500 });
  }
}
