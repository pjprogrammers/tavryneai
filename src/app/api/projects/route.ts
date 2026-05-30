import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore, FieldValue } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { DEFAULT_MODEL } from '@/lib/types/ai';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { z } from 'zod';

const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  framework: z.string().max(50).optional(),
});

const ALLOWED_FRAMEWORKS = ['nextjs', 'react', 'vue', 'svelte', 'express', 'vanilla', 'python'];

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`projects:${auth.uid}`, { maxTokens: 30, refillRate: 1, refillIntervalMs: 2000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const projectsSnap = await adminFirestore
      .collection('projects')
      .where('userId', '==', auth.uid)
      .where('status', '==', 'active')
      .orderBy('updatedAt', 'desc')
      .get();

    const now = new Date();
    const projects = projectsSnap.docs
      .map((doc: any) => {
        const data = doc.data();
        const expiresAt = data.expiresAt?.toDate();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString(),
          expiresAt: expiresAt?.toISOString() || null,
        };
      })
      .filter((p: any) => {
        if (!p.expiresAt) return true;
        return new Date(p.expiresAt) > now;
      });

    return NextResponse.json(projects);
  } catch (err) {
    console.error('[API] GET /api/projects failed:', err);
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`projects:${auth.uid}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    let body: z.infer<typeof createProjectSchema>;
    try {
      body = createProjectSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { title, description, framework } = body;
    const safeFramework = framework && ALLOWED_FRAMEWORKS.includes(framework) ? framework : 'nextjs';

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const newProject = {
      userId: auth.uid,
      title,
      description: description || '',
      framework: safeFramework,
      status: 'active',
      selectedModel: DEFAULT_MODEL,
      tokenCount: 0,
      isPublic: false,
      deployUrl: null,
      githubRepo: null,
      thumbnail: null,
      createdAt: now,
      updatedAt: now,
      expiresAt,
    };

    const ref = await adminFirestore.collection('projects').add(newProject);

    await adminFirestore
      .collection('users')
      .doc(auth.uid)
      .update({ projectCount: FieldValue.increment(1) });

    return NextResponse.json({
      id: ref.id,
      ...newProject,
      createdAt: newProject.createdAt.toISOString(),
      updatedAt: newProject.updatedAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
