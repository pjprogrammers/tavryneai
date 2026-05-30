import { NextRequest } from 'next/server';
import { adminFirestore, FieldValue } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { z } from 'zod';

const deploymentSchema = z.object({
  type: z.enum(['export', 'vercel']),
  status: z.enum(['started', 'completed', 'failed']),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`deployments:${auth.uid}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id: projectId } = await params;

  const projectRef = adminFirestore.collection('projects').doc(projectId);
  const projectSnap = await projectRef.get();
  if (!projectSnap.exists || projectSnap.data()?.userId !== auth.uid) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: z.infer<typeof deploymentSchema>;
  try {
    body = deploymentSchema.parse(await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const depRef = await adminFirestore
    .collection(`projects/${projectId}/deployments`)
    .add({
      userId: auth.uid,
      type: body.type,
      status: body.status,
      metadata: body.metadata || null,
      timestamp: new Date(),
    });

  if (body.status === 'completed') {
    await projectRef.update({
      deployUrl: body.metadata?.url || null,
      updatedAt: new Date(),
    });
  }

  await adminFirestore.collection('user_activity').add({
    userId: auth.uid,
    action: `deployment_${body.type}_${body.status}`,
    projectId,
    details: { deploymentId: depRef.id, metadata: body.metadata },
    timestamp: new Date(),
  }).catch(() => {});

  return new Response(JSON.stringify({ id: depRef.id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`deployments-get:${auth.uid}`, { maxTokens: 20, refillRate: 2, refillIntervalMs: 1000 });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id: projectId } = await params;

  const projectRef = adminFirestore.collection('projects').doc(projectId);
  const projectSnap = await projectRef.get();
  if (!projectSnap.exists || projectSnap.data()?.userId !== auth.uid) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const snapshot = await adminFirestore
    .collection(`projects/${projectId}/deployments`)
    .orderBy('timestamp', 'desc')
    .limit(20)
    .get();

  const deployments = snapshot.docs.map((d: any) => {
    const data = d.data() as Record<string, unknown>;
    const ts = data.timestamp;
    const iso = ts && typeof ts === 'object' && 'toDate' in (ts as object) && typeof (ts as any).toDate === 'function'
      ? (ts as any).toDate().toISOString()
      : ts;
    return { id: d.id, ...data, timestamp: iso };
  });

  return new Response(JSON.stringify(deployments), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
