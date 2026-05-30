'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const handleRedirectResult = useAuthStore((s) => s.handleRedirectResult);
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    handleRedirectResult();
  }, [handleRedirectResult]);

  useEffect(() => {
    if (initialized && user) {
      router.replace('/dashboard');
    } else if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
