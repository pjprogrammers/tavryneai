'use client';
import useSWR from 'swr';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { TokenUsage } from '@/lib/types/user';
import { DAILY_TOKEN_LIMIT } from '@/lib/utils/constants';

const fetcher = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch usage');
  return res.json();
};

export function useTokenUsage() {
  const idToken = useAuthStore((s) => s.idToken);
  const user = useAuthStore((s) => s.user);

  const { data, error, isLoading, mutate } = useSWR<TokenUsage>(
    idToken ? ['/api/user/usage', idToken] : null,
    ([url, token]) => fetcher(url, token as string),
    { refreshInterval: 15000 }
  );

  const usage: TokenUsage = data || {
    tokensUsedToday: user?.tokensUsedToday || 0,
    dailyLimit: DAILY_TOKEN_LIMIT,
    remaining: DAILY_TOKEN_LIMIT - (user?.tokensUsedToday || 0),
    resetTime: user?.tokenResetDate || '',
  };

  const percentage = Math.min((usage.tokensUsedToday / usage.dailyLimit) * 100, 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 100;

  return {
    usage,
    percentage,
    isWarning,
    isCritical,
    isLoading,
    isError: !!error,
    mutate,
  };
}
