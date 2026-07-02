import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { checkRateLimit } from '@/lib/server-rate-limit';

const SHARE_CODE_RE = /^[a-f0-9]{12}$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = checkRateLimit(`share-view:${ip}`, { maxTokens: 30, refillRate: 1, refillIntervalMs: 2000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { code } = await params;

  if (!SHARE_CODE_RE.test(code)) {
    return NextResponse.json({ error: 'Shared session not found' }, { status: 404 });
  }

  const normalizedCode = code.toLowerCase();

  const projectsSnap = await adminFirestore
    .collection('projects')
    .where('shareCode', '==', normalizedCode)
    .where('isPublic', '==', true)
    .limit(1)
    .get();

  if (projectsSnap.empty) {
    return NextResponse.json({ error: 'Shared session not found' }, { status: 404 });
  }

  const projectDoc = projectsSnap.docs[0];
  const projectData = projectDoc.data();

  const messagesSnap = await adminFirestore
    .collection(`projects/${projectDoc.id}/messages`)
    .orderBy('timestamp', 'asc')
    .limit(100)
    .get();

  const messages = messagesSnap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      timestamp: data.timestamp?.toDate?.()?.toISOString(),
    };
  });

  // SECURITY: Strip server-only fields (userId, shareCode, deployUrl) from the
  // public response. The public viewer only needs title, description, framework,
  // and the conversation history.
  const project = {
    id: projectDoc.id,
    title: projectData.title,
    description: projectData.description,
    framework: projectData.framework,
    messages,
  };

  return NextResponse.json(project);
}
