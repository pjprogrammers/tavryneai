'use client';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const setLoading = useAuthStore((s) => s.setLoading);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const unsubscribe = initialize();

    // Timeout: unstick loading state if Firebase never resolves
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10_000);

    import('@/lib/app-check').then((m) => {
      m.initializeAppCheck().catch(() => {});
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
      initRef.current = false;
    };
  }, [initialize, setLoading]);

  return <>{children}</>;
}
