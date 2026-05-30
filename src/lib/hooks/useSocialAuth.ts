'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

export function useSocialAuth() {
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const { signInWithGoogle, signInWithGithub } = useAuthStore();

  const handleGoogle = async () => {
    setError('');
    setSocialLoading('google');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.message) setError(err.message);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGithub = async () => {
    setError('');
    setSocialLoading('github');
    try {
      await signInWithGithub();
    } catch (err: any) {
      if (err?.message) setError(err.message);
    } finally {
      setSocialLoading(null);
    }
  };

  return { error, setError, socialLoading, handleGoogle, handleGithub };
}
