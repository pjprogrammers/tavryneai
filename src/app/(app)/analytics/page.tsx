'use client';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { DAILY_TOKEN_LIMIT, PROVIDER_COLORS } from '@/lib/utils/constants';
import type { UsageStats, ModelUsage, ActivityEntry } from '@/lib/types/analytics';

const fetcher = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('day');
  const idToken = useAuthStore((s) => s.idToken);

  const { data: usage, error: usageErr, isLoading: usageLoading } = useSWR<UsageStats>(
    idToken ? [`/api/analytics/usage?period=${period}`, idToken] : null,
    ([url, token]) => fetcher(url, token as string),
    { refreshInterval: 30000 }
  );

  const { data: models, error: modelsErr, isLoading: modelsLoading } = useSWR<ModelUsage[]>(
    idToken ? ['/api/analytics/models', idToken] : null,
    ([url, token]) => fetcher(url, token as string),
    { refreshInterval: 60000 }
  );

  const { data: activity, error: activityErr, isLoading: activityLoading } = useSWR<ActivityEntry[]>(
    idToken ? ['/api/analytics/activity', idToken] : null,
    ([url, token]) => fetcher(url, token as string),
    { refreshInterval: 30000 }
  );

  const statsCards = usage
    ? [
        {
          label: 'Tokens Used Today',
          value: usage.tokensUsedToday.toLocaleString(),
          max: usage.dailyLimit,
          pct: Math.round((usage.tokensUsedToday / usage.dailyLimit) * 100),
          trend: usage.tokensUsedToday > 0 ? `${((usage.tokensUsedToday / usage.dailyLimit) * 100).toFixed(0)}%` : '0%',
        },
        {
          label: 'Total Tokens',
          value: usage.totalTokensConsumed.toLocaleString(),
          max: null,
          pct: null,
          trend: null,
        },
        {
          label: 'Projects Created',
          value: usage.projectCount.toString(),
          max: null,
          pct: null,
          trend: null,
        },
        {
          label: 'AI Generations',
          value: usage.aiGenerations.toString(),
          max: null,
          pct: null,
          trend: null,
        },
      ]
    : [];

  const showMonthly = period === 'month' || period === 'all';
  const showYearly = period === 'year' || period === 'all';
  const dailyUsage = usage?.dailyUsage || [];
  const monthlyUsage = usage?.monthlyUsage || [];
  const yearlyUsage = usage?.yearlyUsage || [];
  const maxDailyTokens = Math.max(...dailyUsage.map((d) => d.tokens), 1);
  const maxMonthlyTokens = Math.max(...monthlyUsage.map((d) => d.tokens), 1);
  const maxYearlyTokens = Math.max(...yearlyUsage.map((d) => d.tokens), 1);

  const isLoading = usageLoading || modelsLoading || activityLoading;
  const hasError = usageErr || modelsErr || activityErr;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Usage Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">Track your token usage and activity</p>
            </div>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList>
                <TabsTrigger value="day">Daily</TabsTrigger>
                <TabsTrigger value="month">Monthly</TabsTrigger>
                <TabsTrigger value="year">Yearly</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </motion.div>

        {hasError && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            Failed to load analytics data. Please try again later.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
                    <div className="h-8 w-16 bg-muted rounded animate-pulse mb-3" />
                    <div className="h-2 w-full bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            : statsCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        {stat.trend !== null && (
                          <Badge variant="default" className="text-[10px]">{stat.trend}</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      {stat.max && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{stat.pct}%</span>
                            <span>of {stat.max.toLocaleString()}</span>
                          </div>
                          <Progress value={stat.pct} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>
                {period === 'day' ? 'Daily' : period === 'month' ? 'Monthly' : period === 'year' ? 'Yearly' : 'All Time'} Token Usage
              </CardTitle>
              <CardDescription>Token consumption by {period === 'all' ? 'month and year' : period}</CardDescription>
            </CardHeader>
            <CardContent>
              {usageLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : period === 'day' || (!showMonthly && !showYearly) ? (
                dailyUsage.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No data yet. Start generating to see usage.</p>
                ) : (
                  <div className="flex items-end justify-between gap-2 h-40">
                    {dailyUsage.map((d) => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{d.tokens > 0 ? `${(d.tokens / 1000).toFixed(1)}k` : ''}</span>
                        <div
                          className="w-full rounded-t-md bg-primary/60 hover:bg-primary transition-colors"
                          style={{ height: `${(d.tokens / maxDailyTokens) * 100}%`, minHeight: d.tokens > 0 ? '4px' : '0' }}
                        />
                        <span className="text-[10px] text-muted-foreground">{d.day}</span>
                      </div>
                    ))}
                  </div>
                )
              ) : showMonthly && monthlyUsage.length > 0 ? (
                <div className="flex items-end justify-between gap-2 h-40">
                  {monthlyUsage.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{m.tokens > 0 ? `${(m.tokens / 1000).toFixed(1)}k` : ''}</span>
                      <div
                        className="w-full rounded-t-md bg-primary/60 hover:bg-primary transition-colors"
                        style={{ height: `${(m.tokens / maxMonthlyTokens) * 100}%`, minHeight: m.tokens > 0 ? '4px' : '0' }}
                      />
                      <span className="text-[10px] text-muted-foreground">{m.month.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              ) : showYearly && yearlyUsage.length > 0 ? (
                <div className="flex items-end justify-between gap-2 h-40">
                  {yearlyUsage.map((y) => (
                    <div key={y.year} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{y.tokens > 0 ? `${(y.tokens / 1000).toFixed(1)}k` : ''}</span>
                      <div
                        className="w-full rounded-t-md bg-primary/60 hover:bg-primary transition-colors"
                        style={{ height: `${(y.tokens / maxYearlyTokens) * 100}%`, minHeight: y.tokens > 0 ? '4px' : '0' }}
                      />
                      <span className="text-[10px] text-muted-foreground">{y.year}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No data yet. Start generating to see usage.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Distribution</CardTitle>
              <CardDescription>Token usage by AI model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {modelsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-2 w-full bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : !models || models.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No model data yet.</p>
              ) : (
                models.map((m) => (
                  <div key={m.model}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: PROVIDER_COLORS[m.provider] || '#6B7280' }}
                        />
                        <span className="text-sm text-foreground">{m.model.split('/').pop()}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{m.pct}%</span>
                    </div>
                    <Progress value={m.pct} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Recent generation activity</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : !activity || activity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No activity yet. Start generating code to see your activity log.</p>
            ) : (
              <div className="space-y-3">
                {activity.map((entry, i) => (
                  <div key={`${entry.projectId}-${i}`} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{entry.content}</p>
                      <p className="text-xs text-muted-foreground">{entry.projectTitle} · {entry.relativeTime}</p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-4 shrink-0">{entry.tokensUsed.toLocaleString()} tokens</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}