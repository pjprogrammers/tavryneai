import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { checkRateLimit } from '@/lib/server-rate-limit';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = checkRateLimit(`cleanup`, { maxTokens: 1, refillRate: 1, refillIntervalMs: 60000 });
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

    const batch = adminFirestore.batch();
    let count = 0;

    for (const doc of expiredSnapshot.docs) {
      batch.update(doc.ref, { status: 'deleted', updatedAt: now });
      count++;
    }

    if (count > 0) {
      await batch.commit();
    }

    return NextResponse.json({ cleaned: count });
  } catch {
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
