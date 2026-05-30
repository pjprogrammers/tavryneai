import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { z } from 'zod';

const SESSION_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const SessionSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(parsed.data.idToken);

    const rl = checkRateLimit(`session:${decoded.uid}`, { maxTokens: 5, refillRate: 1, refillIntervalMs: 60000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(parsed.data.idToken, {
      expiresIn: SESSION_EXPIRY_MS,
    });

    const response = NextResponse.json({ success: true });
    const isSecure = process.env.NODE_ENV === 'production';
    response.headers.set(
      'Set-Cookie',
      `session=${sessionCookie}; Path=/; HttpOnly${isSecure ? '; Secure' : ''}; SameSite=Lax; Max-Age=${Math.floor(SESSION_EXPIRY_MS / 1000)}`
    );

    return response;
  } catch (err) {
    console.error('[Session] Failed to create session cookie:', err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  const isSecure = process.env.NODE_ENV === 'production';
  response.headers.set(
    'Set-Cookie',
    `session=; Path=/; HttpOnly${isSecure ? '; Secure' : ''}; SameSite=Lax; Max-Age=0`
  );
  return response;
}