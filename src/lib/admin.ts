import 'server-only';

const ADMIN_EMAILS: ReadonlySet<string> = new Set(
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function getAdminPath(): string {
  const raw = process.env.ADMIN_PATH || 'admin';
  const cleaned = raw.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned || 'admin';
}
