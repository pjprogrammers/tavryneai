import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { isAdminEmail } from '@/lib/admin';

const SESSION_COOKIE = 'session';

function escapeForScript(value: string): string {
  return value.replace(/[\\`'"<>&\u2028\u2029]/g, (ch) => {
    switch (ch) {
      case '\\': return '\\\\';
      case '`': return '\\`';
      case '"': return '\\"';
      case "'": return "\\'";
      case '<': return '\\u003c';
      case '>': return '\\u003e';
      case '&': return '\\u0026';
      default: return ch;
    }
  });
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let reason = 'unknown';
  let emailForLog = 'unknown';
  let uidForLog = 'unknown';
  let isAllowed = false;

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      reason = 'no_session';
    } else {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      emailForLog = decodedClaims.email || 'unknown';
      uidForLog = decodedClaims.uid || 'unknown';

      const adminClaim = (decodedClaims as unknown as { admin?: boolean }).admin === true;
      const emailWhitelisted = isAdminEmail(decodedClaims.email);

      if (adminClaim || emailWhitelisted) {
        isAllowed = true;
      } else {
        reason = 'not_admin';
      }
    }
  } catch {
    reason = 'invalid_session';
  }

  if (!isAllowed) {
    const timestamp = new Date().toISOString();
    console.warn(
      `[Security] Admin page access denied. reason=${reason} uid=${uidForLog} email=${emailForLog} at=${timestamp}`,
    );

    const safeReason = escapeForScript(reason);
    const safeTimestamp = escapeForScript(timestamp);
    const safeEmail = escapeForScript(emailForLog);

    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{console.error('%c[Tavryne AI] Admin access denied'," +
              "'color:#ef4444;font-weight:bold;font-size:13px;');" +
              "console.error('[Tavryne AI] reason: " + safeReason + "');" +
              "console.error('[Tavryne AI] account: " + safeEmail + "');" +
              "console.error('[Tavryne AI] timestamp: " + safeTimestamp + "');" +
              "console.error('[Tavryne AI] This attempt has been logged.');" +
              "}catch(e){}})();",
          }}
        />
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <span className="text-8xl font-bold text-muted-foreground block mb-4" aria-hidden="true">404</span>
            <h1 className="text-2xl font-bold text-foreground mb-2">Access denied</h1>
            <p className="text-base text-muted-foreground mb-8 max-w-sm mx-auto">
              You don&apos;t have permission to view this page. The attempt has been logged.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
