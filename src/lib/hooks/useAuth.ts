'use client';
import { useAuthStore } from '@/lib/store/useAuthStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const isAuthenticated = !!user;

  const isAuthorized =
    isAuthenticated &&
    (
      user.emailVerified ||
      user.provider === 'google.com' ||
      user.provider === 'github.com'
    );

  return { user, firebaseUser, loading, initialized, isAuthenticated, isAuthorized };
}
