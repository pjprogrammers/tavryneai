import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { z } from 'zod';

const messagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`messages:${auth.uid}`, { maxTokens: 30, refillRate: 1, refillIntervalMs: 2000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const { id: projectId } = await params;

    const projectRef = adminFirestore.collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (projectSnap.data()!.userId !== auth.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = messagesQuerySchema.parse(Object.fromEntries(searchParams));
    const { page, limit } = query;

    const messagesSnap = await adminFirestore
      .collection(`projects/${projectId}/messages`)
      .orderBy('timestamp', 'asc')
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    const messages = messagesSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString(),
    }));

    return NextResponse.json({
      messages,
      page,
      limit,
      total: messages.length,
    });
  } catch (err) {
    console.error('[API] GET /api/projects/[id]/messages failed:', err);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}
