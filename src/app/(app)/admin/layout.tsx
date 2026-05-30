import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { adminAuth } from '@/lib/firebase/admin';
import { isAdminEmail } from '@/lib/admin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      notFound();
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    if (!isAdminEmail(decodedClaims.email)) {
      notFound();
    }

    return <>{children}</>;
  } catch {
    notFound();
  }
}