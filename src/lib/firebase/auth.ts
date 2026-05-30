import { NextResponse } from 'next/server';
import { adminAuth } from './admin';

export interface AuthResult {
  uid: string;
  email: string;
  emailVerified: boolean;
  provider?: string;
}

export async function verifyAuth(request: Request): Promise<AuthResult | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as any;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email || '',
      emailVerified: !!decoded.email_verified,
      provider: (decoded as any).firebase?.sign_in_provider || 'email',
    };
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 }) as any;
  }
}

export function isErrorResponse(result: any): result is NextResponse {
  return result instanceof NextResponse;
}

/**
 * Guard: reject if email not verified.
 * Social providers (Google, GitHub) are always allowed.
 */
export function requireEmailVerified(auth: AuthResult): NextResponse | null {
  const isSocialProvider = auth.provider === 'google.com' || auth.provider === 'github.com';
  if (!auth.emailVerified && !isSocialProvider) {
    return NextResponse.json(
      {
        error: 'Please verify your email before accessing this feature.',
        code: 'EMAIL_NOT_VERIFIED',
        requiresVerification: true,
      },
      { status: 403 },
    ) as any;
  }
  return null;
}
