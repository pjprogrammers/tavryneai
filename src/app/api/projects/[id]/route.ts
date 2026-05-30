import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminFirestore } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';

const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  framework: z.string().max(50).optional(),
  selectedModel: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
  thumbnail: z.string().max(2000).nullable().optional(),
  status: z.enum(['active', 'deleted', 'archived']).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`projects:${auth.uid}`, { maxTokens: 30, refillRate: 1, refillIntervalMs: 2000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const { id: projectId } = await params;

    const docRef = adminFirestore.collection('projects').doc(projectId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const data = docSnap.data()!;

    if (data.userId !== auth.uid && !data.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if project has expired
    const expiresAt = data.expiresAt?.toDate();
    if (expiresAt && expiresAt < new Date()) {
      // Lazy cleanup: mark as deleted
      await docRef.update({ status: 'deleted', updatedAt: new Date() });
      return NextResponse.json({ error: 'Project has expired' }, { status: 410 });
    }

    return NextResponse.json({
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      expiresAt: expiresAt?.toISOString() || null,
    });
  } catch (err) {
    console.error('[Project] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load project' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`projects:${auth.uid}`, { maxTokens: 20, refillRate: 1, refillIntervalMs: 3000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const { id: projectId } = await params;

    let updates: z.infer<typeof updateProjectSchema>;
    try {
      updates = updateProjectSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const docRef = adminFirestore.collection('projects').doc(projectId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (docSnap.data()!.userId !== auth.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sanitizedUpdates: Record<string, unknown> = {
      ...Object.fromEntries(
        Object.entries(updates).filter(([, v]) => v !== undefined)
      ),
      updatedAt: new Date(),
    };

    await docRef.update(sanitizedUpdates);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`projects:${auth.uid}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const { id: projectId } = await params;

    const docRef = adminFirestore.collection('projects').doc(projectId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (docSnap.data()!.userId !== auth.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete
    await docRef.update({ status: 'deleted', updatedAt: new Date() });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
