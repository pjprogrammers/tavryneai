import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { z } from 'zod';

const feedbackSchema = z.object({
  messageId: z.string().min(1),
  filename: z.string().min(1),
  status: z.enum(['accepted', 'rejected']),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`feedback:${auth.uid}`, { maxTokens: 30, refillRate: 1, refillIntervalMs: 2000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const { id: projectId } = await params;

    const projectRef = adminFirestore.collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists || projectSnap.data()?.userId !== auth.uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let body: z.infer<typeof feedbackSchema>;
    try {
      body = feedbackSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    await adminFirestore
      .collection(`projects/${projectId}/messages/${body.messageId}/feedback`)
      .add({
        userId: auth.uid,
        filename: body.filename,
        status: body.status,
        timestamp: new Date(),
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Feedback] Failed to submit feedback:', err);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
