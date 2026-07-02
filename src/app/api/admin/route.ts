import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { isErrorResponse, requireEmailVerified, requireAdmin } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { DAILY_TOKEN_LIMIT } from '@/lib/utils/constants';

function relativeTime(ts: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - ts.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return ts.toLocaleDateString();
}

function truncate(str: string, max = 80): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '...';
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = checkRateLimit(`admin:${ip}`, { maxTokens: 10, refillRate: 1, refillIntervalMs: 6000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const now = new Date();

    const allUsersSnap = await adminFirestore.collection('users').get();
    const allProjectsSnap = await adminFirestore.collection('projects').get();

    let totalTokensConsumed = 0;
    let totalTokensToday = 0;
    let activeToday = 0;
    let freeUsers = 0;
    let proUsers = 0;

    const users: any[] = [];
    const userTokenMap = new Map<string, number>();

    for (const doc of allUsersSnap.docs) {
      const d = doc.data();
      const tokens = d.totalTokensConsumed || 0;
      const tokensToday = d.tokensUsedToday || 0;
      totalTokensConsumed += tokens;
      totalTokensToday += tokensToday;
      userTokenMap.set(doc.id, tokens);

      const lastLogin = d.lastLoginAt?.toDate?.() || d.createdAt?.toDate?.() || new Date(0);
      const isActiveToday = lastLogin > new Date(now.getTime() - 86400000);
      if (isActiveToday) activeToday++;

      const plan = d.planType || 'free';
      if (plan === 'pro') proUsers++;
      else freeUsers++;

      users.push({
        uid: doc.id,
        email: d.email || '',
        displayName: d.displayName || 'Unknown',
        avatarUrl: d.avatarUrl || '',
        planType: plan,
        createdAt: d.createdAt?.toDate?.()?.toISOString() || d.createdAt || '',
        lastLoginAt: lastLogin.toISOString(),
        lastLoginRelative: relativeTime(lastLogin),
        isActiveToday,
        tokensUsedToday: tokensToday,
        totalTokensConsumed: tokens,
        projectCount: d.projectCount || 0,
        emailVerified: !!d.emailVerified,
      });
    }

    const totalProjects = allProjectsSnap.size;
    let activeProjectCount = 0;
    for (const doc of allProjectsSnap.docs) {
      if (doc.data().status === 'active') activeProjectCount++;
    }

    const topUsers = [...users]
      .sort((a, b) => b.totalTokensConsumed - a.totalTokensConsumed)
      .slice(0, 10)
      .map((u) => ({ uid: u.uid, email: u.email, displayName: u.displayName, totalTokensConsumed: u.totalTokensConsumed }));

    const todayKey = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 6 * 86400000);

    const projectUserMap = new Map<string, string>();
    for (const doc of allProjectsSnap.docs) {
      const d = doc.data();
      if (d.userId) projectUserMap.set(doc.id, d.userId);
    }

    const activityPromises = allProjectsSnap.docs.slice(0, 50).map(async (doc: any) => {
      const pid = doc.id;
      const snap = await adminFirestore
        .collection(`projects/${pid}/messages`)
        .where('role', '==', 'assistant')
        .where('timestamp', '>=', weekAgo)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();
      return snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => ({ pid, ...d.data(), id: d.id }));
    });

    const activityResults = await Promise.all(activityPromises);
    const allActivity: any[] = [];
    const dailyTokens = new Map<string, number>();
    const userByUid = new Map(users.map((u) => [u.uid, u]));

    for (const msgs of activityResults) {
      for (const msg of msgs) {
        const ts = msg.timestamp?.toDate?.();
        if (!ts) continue;
        const dayKey = ts.toISOString().split('T')[0];
        dailyTokens.set(dayKey, (dailyTokens.get(dayKey) || 0) + (msg.tokensUsed || 0));

        if (allActivity.length >= 50) continue;
        const ownerUid = projectUserMap.get(msg.pid);
        const owner = ownerUid ? userByUid.get(ownerUid) : undefined;
        allActivity.push({
          projectId: msg.pid,
          userId: ownerUid || null,
          userEmail: owner?.email || null,
          userDisplayName: owner?.displayName || null,
          content: truncate(msg.content || ''),
          tokensUsed: msg.tokensUsed || 0,
          timestamp: ts.toISOString(),
          relativeTime: relativeTime(ts),
        });
      }
    }

    allActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const dailyUsage: { day: string; tokens: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      const dateObj = new Date(key + 'T00:00:00Z');
      const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      dailyUsage.push({ day: dayLabel, tokens: dailyTokens.get(key) || 0 });
    }

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalProjects,
        activeProjects: activeProjectCount,
        totalTokensConsumed,
        totalTokensToday,
        dailyLimit: DAILY_TOKEN_LIMIT,
        activeToday,
        freeUsers,
        proUsers,
        timestamp: now.toISOString(),
      },
      users,
      topUsers,
      recentActivity: allActivity.slice(0, 20),
      dailyUsage,
      providers: [
        { name: 'NVIDIA NIM', status: 'connected', modelCount: 8 },
        { name: 'OpenCode Zen', status: 'connected', modelCount: 7 },
        { name: 'OpenRouter', status: 'connected', modelCount: 7 },
      ],
    });
  } catch (err) {
    console.error('[API] GET /api/admin failed:', err);
    return NextResponse.json({ error: 'Failed to load admin data' }, { status: 500 });
  }
}
