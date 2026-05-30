import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { adminFirestore, FieldValue } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`share:${auth.uid}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const { id: projectId } = await params;
    const uid = auth.uid;

    const projectRef = adminFirestore.collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectData = projectSnap.data();
    if (projectData?.userId !== uid) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const shareCode = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    await projectRef.update({
      shareCode,
      isPublic: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ shareCode });
  } catch (err) {
    console.error('[Share] Failed to generate share link:', err);
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 });
  }
}
