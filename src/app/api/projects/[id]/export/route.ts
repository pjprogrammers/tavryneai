import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`export:${auth.uid}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const { id: projectId } = await params;

    // Verify project ownership
    const projectRef = adminFirestore.collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (projectSnap.data()!.userId !== auth.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Load latest snapshot for file contents
    const snapshotsQuery = await adminFirestore
      .collection(`projects/${projectId}/snapshots`)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    let files: Array<{ path: string; content: string }> = [];
    if (!snapshotsQuery.empty) {
      files = snapshotsQuery.docs[0].data().files || [];
    }

    const project = projectSnap.data()!;

    return NextResponse.json({
      project: {
        title: project.title,
        description: project.description,
        framework: project.framework,
      },
      files,
      exportDate: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
