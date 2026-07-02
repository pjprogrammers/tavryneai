import { NextResponse } from 'next/server';
import { adminAuth } from './admin';
import { isAdminEmail } from '@/lib/admin';

export interface AuthResult {
  uid: string;
  email: string;
  emailVerified: boolean;
  provider?: string;
  isAdmin: boolean;
  adminClaim: boolean;
}

const JWT_SHAPE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export async function verifyAuth(request: Request): Promise<AuthResult | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token || !JWT_SHAPE.test(token) || token.length > 4096) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    const adminClaim = (decoded as unknown as { admin?: boolean }).admin === true;
    const email = decoded.email || '';
    return {
      uid: decoded.uid,
      email,
      emailVerified: !!decoded.email_verified,
      provider: (decoded as unknown as { firebase?: { sign_in_provider?: string } }).firebase?.sign_in_provider || 'email',
      adminClaim,
      isAdmin: adminClaim || isAdminEmail(email),
    };
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export function isErrorResponse(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}

/**
 * Guard: reject if email not verified.
 * Social providers (Google, GitHub) are always considered verified because the
 * identity provider has already validated ownership of the email address.
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
    );
  }
  return null;
}

/**
 * Guard: reject if the caller is not an admin. Returns a 401/403 NextResponse
 * or a typed AdminAuthResult on success. Authorization comes ONLY from the
 * signed Firebase ID token (custom claim `admin === true`) with the env-var
 * email whitelist as a fallback for migration. No client-provided data is
 * trusted.
 */
export interface AdminAuthResult extends AuthResult {
  isAdmin: true;
}

export function requireAdmin(request: Request): Promise<AdminAuthResult | NextResponse> {
  return (async () => {
    const auth = await verifyAuth(request);
    if (auth instanceof NextResponse) return auth;
    if (!auth.isAdmin) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const ua = request.headers.get('user-agent') || 'unknown';
      console.warn(
        `[Security] Admin access denied. uid=${auth.uid} email=${auth.email} ip=${ip} ua=${ua.slice(0, 120)}`,
      );
      return NextResponse.json(
        { error: 'Forbidden', code: 'ADMIN_REQUIRED' },
        { status: 403 },
      );
    }
    const emailGuard = requireEmailVerified(auth);
    if (emailGuard) return emailGuard;
    return auth as AdminAuthResult;
  })();
}
