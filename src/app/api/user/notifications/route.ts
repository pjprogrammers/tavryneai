import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminFirestore, FieldValue } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';

export const dynamic = 'force-dynamic';

const markAllReadSchema = z.object({
  ids: z.array(z.string().min(1).max(128)).max(500).optional(),
});

export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`notifications-read:${auth.uid}`, { maxTokens: 30, refillRate: 5, refillIntervalMs: 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const onlyUnread = url.searchParams.get('unread') === '1';

    let query = adminFirestore
      .collection('users')
      .doc(auth.uid)
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (onlyUnread) {
      query = query.where('read', '==', false);
    }

    const snap = await query.get();
    const items = snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        message: data.message || '',
        type: data.type || 'info',
        read: !!data.read,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error('[notifications] GET failed:', err);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyAuth(request);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`notifications-write:${auth.uid}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    let body: z.infer<typeof markAllReadSchema>;
    try {
      body = markAllReadSchema.parse(await request.json());
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const colRef = adminFirestore.collection('users').doc(auth.uid).collection('notifications');
    let docsToUpdate;
    if (body.ids && body.ids.length > 0) {
      const refs = body.ids.map((id) => colRef.doc(id));
      const snap = await adminFirestore.getAll(...refs);
      docsToUpdate = snap.filter((s: FirebaseFirestore.DocumentSnapshot) => s.exists);
    } else {
      const snap = await colRef.where('read', '==', false).get();
      docsToUpdate = snap.docs;
    }

    if (docsToUpdate.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    const batchSize = 450;
    let updated = 0;
    for (let i = 0; i < docsToUpdate.length; i += batchSize) {
      const batch = adminFirestore.batch();
      const chunk = docsToUpdate.slice(i, i + batchSize);
      chunk.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot) => {
        batch.update(doc.ref, { read: true, readAt: FieldValue.serverTimestamp() });
      });
      await batch.commit();
      updated += chunk.length;
    }

    return NextResponse.json({ updated });
  } catch (err) {
    console.error('[notifications] PATCH failed:', err);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
