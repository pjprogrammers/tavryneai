import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';
import type { ActivityEntry } from '@/lib/types/analytics';

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

function truncate(str: string, max = 60): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '...';
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

    // 1. Get user's project IDs and titles
    const projectsSnap = await adminFirestore
      .collection('projects')
      .where('userId', '==', uid)
      .get();

    const projectMap = new Map<string, string>();
    for (const doc of projectsSnap.docs) {
      const data = doc.data();
      if (data.status !== 'deleted') {
        projectMap.set(doc.id, data.title || 'Untitled');
      }
    }

    const projectIds: string[] = Array.from(projectMap.keys());

    // 2. Fetch last 5 assistant messages per project (limit to reduce data)
    const messageQueries = projectIds.map((pid: string) =>
      adminFirestore
        .collection(`projects/${pid}/messages`)
        .where('role', '==', 'assistant')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get()
    );

    const messageSnaps = await Promise.all(messageQueries);

    // 3. Collect all messages with project context
    const allMessages: ActivityEntry[] = [];
    for (let i = 0; i < messageSnaps.length; i++) {
      const pid = projectIds[i];
      const title = projectMap.get(pid) || 'Untitled';
      for (const doc of messageSnaps[i].docs) {
        const data = doc.data();
        allMessages.push({
          projectId: pid,
          projectTitle: title,
          content: truncate(data.content || ''),
          tokensUsed: data.tokensUsed || 0,
          timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
          relativeTime: data.timestamp ? relativeTime(data.timestamp.toDate()) : 'Unknown',
        });
      }
    }

    // 4. Sort by timestamp descending and take top 10
    allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const top10 = allMessages.slice(0, 10);

    return NextResponse.json(top10);
  } catch (err) {
    console.error('[Analytics/Activity] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch activity log' }, { status: 500 });
  }
}
