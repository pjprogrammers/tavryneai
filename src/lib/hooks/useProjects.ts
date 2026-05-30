'use client';
import { useEffect } from 'react';
import useSWR from 'swr';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useProjectStore } from '@/lib/store/useProjectStore';

const fetcher = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function useProjects() {
  const idToken = useAuthStore((s) => s.idToken);
  const user = useAuthStore((s) => s.user);
  const { projects, loadProjects } = useProjectStore();

  const { data, error, isLoading, mutate } = useSWR(
    idToken ? ['/api/projects', idToken] : null,
    ([url, token]) => fetcher(url, token as string),
    { refreshInterval: 30000 }
  );

  useEffect(() => {
    if (user) {
      loadProjects(user.uid);
    }
  }, [user, loadProjects]);

  return {
    projects: data || projects,
    isLoading,
    isError: !!error,
    mutate,
  };
}
