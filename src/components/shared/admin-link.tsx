'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';

export function AdminLink() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const idToken = useAuthStore((s) => s.idToken);

  useEffect(() => {
    if (!idToken) return;
    fetch('/api/admin', { headers: { Authorization: `Bearer ${idToken}` } })
      .then((res) => setIsAdmin(res.ok))
      .catch(() => setIsAdmin(false));
  }, [idToken]);

  if (isAdmin !== true) return null;

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';

  return (
    <Link
      href={`/${adminPath}`}
      className="flex items-center gap-2 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      Admin
    </Link>
  );
}
