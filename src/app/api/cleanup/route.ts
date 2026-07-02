import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { adminFirestore } from '@/lib/firebase/admin';
import { checkRateLimit } from '@/lib/server-rate-limit';

const BATCH_LIMIT = 450;

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  const expected = `Bearer ${cronSecret || ''}`;
  if (!cronSecret || !authHeader || !safeEqual(authHeader, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = checkRateLimit(`cleanup:${ip}`, { maxTokens: 1, refillRate: 1, refillIntervalMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const now = new Date();
    const expiredSnapshot = await adminFirestore
      .collection('projects')
      .where('status', '==', 'active')
      .where('expiresAt', '<', now)
      .get();

    if (expiredSnapshot.empty) {
      return NextResponse.json({ cleaned: 0 });
    }

    let cleaned = 0;
    const refs = expiredSnapshot.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.ref);
    for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
      const batch = adminFirestore.batch();
      const chunk = refs.slice(i, i + BATCH_LIMIT);
      for (const ref of chunk) {
        batch.update(ref, { status: 'deleted', updatedAt: now });
      }
      await batch.commit();
      cleaned += chunk.length;
    }

    return NextResponse.json({ cleaned });
  } catch (err) {
    console.error('[cleanup] failed:', err);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
