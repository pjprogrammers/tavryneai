import { NextResponse } from 'next/server';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { adminFirestore } from '@/lib/firebase/admin';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { z } from 'zod';

const avatarSchema = z.object({
  avatarUrl: z.string().url().max(2000),
});

export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`avatar:${auth.uid}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    let body: z.infer<typeof avatarSchema>;
    try {
      body = avatarSchema.parse(await request.json());
    } catch {
      return NextResponse.json({ error: 'Invalid avatar URL' }, { status: 400 });
    }

    await adminFirestore.collection('users').doc(auth.uid).update({ avatarUrl: body.avatarUrl });

    return NextResponse.json({ avatarUrl: body.avatarUrl });
  } catch {
    return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 });
  }
}
