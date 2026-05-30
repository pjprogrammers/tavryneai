import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const projectsSnap = await adminFirestore
    .collection('projects')
    .where('shareCode', '==', code)
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

  const messages = messagesSnap.docs.map((d: any) => ({
    id: d.id,
    ...d.data(),
    timestamp: d.data().timestamp?.toDate()?.toISOString(),
  }));

  const project = {
    id: projectDoc.id,
    title: projectData.title,
    description: projectData.description,
    framework: projectData.framework,
    messages,
  };

  return NextResponse.json(project);
}
