import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { adminFirestore, FieldValue } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';

async function authorizeShareAccess(req: NextRequest, projectId: string) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return { error: auth };
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return { error: emailGuard };

  const projectRef = adminFirestore.collection('projects').doc(projectId);
  const projectSnap = await projectRef.get();
  if (!projectSnap.exists) {
    return { error: NextResponse.json({ error: 'Project not found' }, { status: 404 }) };
  }
  if (projectSnap.data()?.userId !== auth.uid) {
    return { error: NextResponse.json({ error: 'Not authorized' }, { status: 403 }) };
  }
  return { auth, projectRef };
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  const rl = checkRateLimit(`share:${projectId}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const access = await authorizeShareAccess(req, projectId);
    if ('error' in access) return access.error;

    const { projectRef } = access;
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  const rl = checkRateLimit(`share-revoke:${projectId}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const access = await authorizeShareAccess(req, projectId);
    if ('error' in access) return access.error;

    const { projectRef } = access;
    await projectRef.update({
      shareCode: null,
      isPublic: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Share] Failed to revoke share link:', err);
    return NextResponse.json({ error: 'Failed to revoke share link' }, { status: 500 });
  }
}

