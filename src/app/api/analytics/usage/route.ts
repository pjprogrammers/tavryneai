import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { DAILY_TOKEN_LIMIT } from '@/lib/utils/constants';
import type { UsageStats, DailyUsage, MonthlyUsage, YearlyUsage } from '@/lib/types/analytics';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getRelativeDay(d: Date, offset: number): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - offset));
  return date.toISOString().split('T')[0];
}

function getDayLabel(dayKey: string): string {
  const date = new Date(dayKey + 'T00:00:00Z');
  return DAY_LABELS[date.getUTCDay()];
}

function getMonthKey(dayKey: string): string {
  return dayKey.slice(0, 7);
}

function getYearKey(dayKey: string): string {
  return dayKey.slice(0, 4);
}

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`analytics:${auth.uid}`, { maxTokens: 30, refillRate: 1, refillIntervalMs: 2000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const uid = auth.uid;
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'day';

    const userSnap = await adminFirestore.collection('users').doc(uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userSnap.data()!;
    const tokensUsedToday = userData.tokensUsedToday || 0;
    const totalTokensConsumed = userData.totalTokensConsumed || 0;
    const projectCount = userData.projectCount || 0;

    const rawDaily = (userData.dailyUsage || {}) as Record<string, number>;

    // Always compute daily usage (last 7 days) for the chart
    const dailyUsage: DailyUsage[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayKey = getRelativeDay(new Date(), i);
      dailyUsage.push({
        day: getDayLabel(dayKey),
        tokens: rawDaily[dayKey] || 0,
      });
    }

    // Compute AI generations from all-time daily usage (non-zero days)
    let aiGenerations = 0;
    for (const tokens of Object.values(rawDaily)) {
      if (tokens > 0) aiGenerations++;
    }

    let monthlyUsage: MonthlyUsage[] = [];
    let yearlyUsage: YearlyUsage[] = [];

    if (period === 'month' || period === 'all') {
      const monthMap = new Map<string, number>();
      for (const [dayKey, tokens] of Object.entries(rawDaily)) {
        const mk = getMonthKey(dayKey);
        monthMap.set(mk, (monthMap.get(mk) || 0) + tokens);
      }
      monthlyUsage = Array.from(monthMap.entries())
        .map(([month, tokens]) => {
          const [y, m] = month.split('-').map(Number);
          return { month: `${MONTH_LABELS[m - 1]} ${y}`, tokens };
        })
        .sort((a, b) => {
          const [aMon, aYr] = a.month.split(' ');
          const [bMon, bYr] = b.month.split(' ');
          const ay = parseInt(aYr), by = parseInt(bYr);
          if (ay !== by) return ay - by;
          return MONTH_LABELS.indexOf(aMon) - MONTH_LABELS.indexOf(bMon);
        });
    }

    if (period === 'year' || period === 'all') {
      const yearMap = new Map<string, number>();
      for (const [dayKey, tokens] of Object.entries(rawDaily)) {
        const yk = getYearKey(dayKey);
        yearMap.set(yk, (yearMap.get(yk) || 0) + tokens);
      }
      yearlyUsage = Array.from(yearMap.entries())
        .map(([year, tokens]) => ({ year, tokens }))
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));
    }

    const result: UsageStats = {
      tokensUsedToday,
      totalTokensConsumed,
      projectCount,
      aiGenerations,
      dailyLimit: DAILY_TOKEN_LIMIT,
      dailyUsage,
      monthlyUsage,
      yearlyUsage,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('[Analytics/Usage] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 });
  }
}