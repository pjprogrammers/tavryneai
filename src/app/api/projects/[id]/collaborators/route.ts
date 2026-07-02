import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminFirestore, FieldValue } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';

export const dynamic = 'force-dynamic';

const inviteSchema = z.object({
  email: z.string().email().max(254),
  role: z.enum(['editor', 'viewer']),
});

interface CollaboratorDoc {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'editor' | 'viewer' | 'owner';
  invitedAt?: { toDate(): Date } | Date | null;
  acceptedAt?: { toDate(): Date } | Date | null;
}

async function authorizeOwner(req: NextRequest, projectId: string) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return { error: auth };
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return { error: emailGuard };

  const projectRef = adminFirestore.collection('projects').doc(projectId);
  const projectSnap = await projectRef.get();
  if (!projectSnap.exists) {
    return { error: NextResponse.json({ error: 'Project not found' }, { status: 404 }) };
  }
  const data = projectSnap.data();
  if (data?.userId !== auth.uid) {
    return { error: NextResponse.json({ error: 'Not authorized' }, { status: 403 }) };
  }
  return { auth, projectRef, projectData: data };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const access = await authorizeOwner(req, projectId);
  if ('error' in access) return access.error;
  const { auth, projectRef } = access;

  try {
    const collaboratorsSnap = await projectRef.collection('collaborators').get();
    const list: CollaboratorDoc[] = [];

    list.push({
      uid: auth.uid,
      email: auth.email || '',
      displayName: '',
      avatarUrl: null,
      role: 'owner',
    });

    for (const doc of collaboratorsSnap.docs) {
      const data = doc.data();
      const uid = doc.id;
      const userSnap = await adminFirestore.collection('users').doc(uid).get();
      const userData = userSnap.exists ? userSnap.data() : null;
      list.push({
        uid,
        email: data.email || userData?.email || '',
        displayName: userData?.displayName || data.email || '',
        avatarUrl: userData?.avatarUrl || null,
        role: data.role || 'viewer',
        invitedAt: data.invitedAt,
        acceptedAt: data.acceptedAt,
      });
    }

    return NextResponse.json({ collaborators: list });
  } catch (err) {
    console.error('[collaborators] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load collaborators' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const access = await authorizeOwner(req, projectId);
  if ('error' in access) return access.error;
  const { auth, projectRef } = access;

  const rl = checkRateLimit(`collab-invite:${projectId}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 5000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many invites. Please wait.' }, { status: 429 });
  }

  try {
    let body: z.infer<typeof inviteSchema>;
    try {
      body = inviteSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 });
    }

    const lowerEmail = body.email.toLowerCase();
    if (lowerEmail === (auth.email || '').toLowerCase()) {
      return NextResponse.json({ error: 'You are already the owner of this project' }, { status: 400 });
    }

    const usersSnap = await adminFirestore
      .collection('users')
      .where('email', '==', lowerEmail)
      .limit(1)
      .get();

    if (usersSnap.empty) {
      return NextResponse.json({
        error: 'No user with that email exists yet. They must sign up first.',
      }, { status: 404 });
    }

    const userDoc = usersSnap.docs[0];
    const invitedUid = userDoc.id;

    await projectRef.collection('collaborators').doc(invitedUid).set({
      email: lowerEmail,
      role: body.role,
      invitedAt: FieldValue.serverTimestamp(),
      invitedBy: auth.uid,
    }, { merge: true });

    await adminFirestore
      .collection('users')
      .doc(invitedUid)
      .collection('notifications')
      .add({
        type: 'info',
        title: 'Project invitation',
        message: `You have been invited to collaborate on a project.`,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ success: true, uid: invitedUid });
  } catch (err) {
    console.error('[collaborators] POST failed:', err);
    return NextResponse.json({ error: 'Failed to invite collaborator' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const access = await authorizeOwner(req, projectId);
  if ('error' in access) return access.error;
  const { auth } = access;

  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');
  if (!uid || uid.length > 128 || uid === auth.uid) {
    return NextResponse.json({ error: 'Invalid collaborator' }, { status: 400 });
  }

  try {
    await adminFirestore
      .collection('projects')
      .doc(projectId)
      .collection('collaborators')
      .doc(uid)
      .delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[collaborators] DELETE failed:', err);
    return NextResponse.json({ error: 'Failed to remove collaborator' }, { status: 500 });
  }
}
