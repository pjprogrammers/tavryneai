const ADMIN_EMAILS_ENV = process.env.ADMIN_EMAILS || '';

export const ADMIN_EMAILS: string[] = ADMIN_EMAILS_ENV
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
