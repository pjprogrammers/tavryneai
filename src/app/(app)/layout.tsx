'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { SearchOverlay } from '@/components/shared/search-overlay';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthorized, loading } = useAuth();
  const router = useRouter();
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

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0">
        {children}
      </main>
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
