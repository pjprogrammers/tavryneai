import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { adminFirestore } from '@/lib/firebase/admin';
import { checkRateLimit } from '@/lib/server-rate-limit';

const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  colorTheme: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`preferences:${auth.uid}`, { maxTokens: 30, refillRate: 1, refillIntervalMs: 2000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    let body: z.infer<typeof preferencesSchema>;
    try {
      body = preferencesSchema.parse(await request.json());
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    for (const key of ['theme', 'colorTheme'] as const) {
      if (body[key] !== undefined) {
        await adminFirestore.collection('users').doc(auth.uid).update({
          [`preferences.${key}`]: body[key],
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API] POST /api/user/preferences failed:', err);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
