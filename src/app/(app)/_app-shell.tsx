'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { SearchOverlay } from '@/components/shared/search-overlay';

export function AppShell({ children, adminPath }: { children: React.ReactNode; adminPath: string }) {
  const { isAuthenticated, isAuthorized, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAuthorized && !window.location.pathname.includes('/verify-email')) {
        router.push('/verify-email');
      }
    }
  }, [loading, isAuthenticated, isAuthorized, router]);

  const isProject = pathname?.startsWith('/projects/') ?? false;

  return (
    <div
      className={
        isProject
          ? 'h-screen bg-background overflow-hidden'
          : 'min-h-screen bg-background flex'
      }
    >
      <AppSidebar adminPath={adminPath} />
      <main
        className={
          isProject
            ? 'flex-1 h-full min-h-0 overflow-hidden'
            : 'flex-1 flex flex-col min-h-screen pb-16 lg:pb-0'
        }
      >
        {children}
      </main>
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
