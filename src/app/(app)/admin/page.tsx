'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface AdminData {
  stats: {
    totalUsers: number;
    totalProjects: number;
    activeProjects: number;
    totalTokensConsumed: number;
    totalTokensToday: number;
    dailyLimit: number;
    activeToday: number;
    freeUsers: number;
    proUsers: number;
    timestamp: string;
  };
  users: UserRow[];
  topUsers: { uid: string; email: string; displayName: string; totalTokensConsumed: number }[];
  recentActivity: { projectId: string; content: string; tokensUsed: number; timestamp: string; relativeTime: string }[];
  dailyUsage: { day: string; tokens: number }[];
  providers: { name: string; status: string; modelCount: number }[];
}

interface UserRow {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  planType: string;
  createdAt: string;
  lastLoginAt: string;
  lastLoginRelative: string;
  isActiveToday: boolean;
  tokensUsedToday: number;
  totalTokensConsumed: number;
  projectCount: number;
  emailVerified: boolean;
}

function TokenBar({ used, max }: { used: number; max: number }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-primary';
  return (
    <div className="w-full bg-secondary rounded-full h-1.5">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function ChartBar({ day, tokens, max }: { day: string; tokens: number; max: number }) {
  const pct = max > 0 ? (tokens / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[10px] text-muted-foreground">{tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : tokens}</span>
      <div className="w-full h-24 bg-secondary/50 rounded-lg relative overflow-hidden">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(pct, 2)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute bottom-0 w-full rounded-lg bg-gradient-to-t from-primary to-primary/60"
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{day}</span>
    </div>
  );
}

function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(iso).getTime();
      const sec = Math.floor(diff / 1000);
      if (sec < 60) setLabel('just now');
      else if (sec < 3600) setLabel(`${Math.floor(sec / 60)}m ago`);
      else if (sec < 86400) setLabel(`${Math.floor(sec / 3600)}h ago`);
      else setLabel(`${Math.floor(sec / 86400)}d ago`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [iso]);
  return <span className="text-muted-foreground">{label}</span>;
}

const SORT_OPTIONS = [
  { value: 'tokens-desc', label: 'Most Tokens Used' },
  { value: 'tokens-asc', label: 'Least Tokens Used' },
  { value: 'recent', label: 'Recently Active' },
  { value: 'newest', label: 'Newest First' },
  { value: 'projects-desc', label: 'Most Projects' },
];

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('tokens-desc');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const idToken = useAuthStore((s) => s.idToken);

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    fetch('/api/admin', { headers: { Authorization: `Bearer ${idToken}` } })
      .then((res) => {
        if (res.ok) { setIsAdmin(true); return res.json(); }
        setIsAdmin(false);
        return null;
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, [idToken]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    let list = [...data.users];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      switch (sort) {
        case 'tokens-desc': return b.totalTokensConsumed - a.totalTokensConsumed;
        case 'tokens-asc': return a.totalTokensConsumed - b.totalTokensConsumed;
        case 'recent': return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime();
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'projects-desc': return b.projectCount - a.projectCount;
        default: return 0;
      }
    });
    return list;
  }, [data, search, sort]);

  const maxDailyToken = useMemo(() => {
    if (!data) return 1;
    return Math.max(...data.dailyUsage.map((d) => d.tokens), 1);
  }, [data]);

  if (isAdmin === false) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground">Not Found</p>
        </div>
      </div>
    );
  }

  if (isAdmin === null || !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const s = data.stats;

  const statCards = [
    { label: 'Total Users', value: s.totalUsers.toLocaleString(), sub: `${s.activeToday} active today`, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Today', value: s.activeToday.toLocaleString(), sub: `${((s.activeToday / Math.max(s.totalUsers, 1)) * 100).toFixed(0)}% of users`, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Projects', value: s.totalProjects.toLocaleString(), sub: `${s.activeProjects} active`, color: 'from-violet-500 to-violet-600' },
    { label: 'Tokens Today', value: s.totalTokensToday.toLocaleString(), sub: `${s.dailyLimit.toLocaleString()} daily limit`, color: 'from-amber-500 to-amber-600' },
    { label: 'Total Tokens', value: s.totalTokensConsumed.toLocaleString(), sub: 'lifetime consumption', color: 'from-rose-500 to-rose-600' },
    { label: 'Free Users', value: s.freeUsers.toLocaleString(), sub: `${s.proUsers} pro`, color: 'from-cyan-500 to-cyan-600' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(s.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-12 mb-8">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="border-l-[3px]" style={{ borderLeftColor: `var(--${stat.color.split(' ')[0].replace('from-', '')})` }}>
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users ({s.totalUsers})</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="providers">Providers</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base">Daily Token Consumption (7 days)</CardTitle>
                      <CardDescription>Platform-wide token usage per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-1 h-40">
                        {data.dailyUsage.map((d) => (
                          <ChartBar key={d.day} day={d.day} tokens={d.tokens} max={maxDailyToken} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top Users</CardTitle>
                      <CardDescription>Highest token consumption</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {data.topUsers.map((u, i) => (
                        <div key={u.uid} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                            <span className="text-sm truncate">{u.displayName}</span>
                          </div>
                          <span className="text-sm font-mono text-muted-foreground shrink-0">
                            {u.totalTokensConsumed >= 1000
                              ? `${(u.totalTokensConsumed / 1000).toFixed(1)}k`
                              : u.totalTokensConsumed}
                          </span>
                        </div>
                      ))}
                      {data.topUsers.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No usage data yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base">AI Provider Status</CardTitle>
                      <CardDescription>All providers operational</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {data.providers.map((p) => (
                          <div key={p.name} className="flex items-center gap-3 p-4 rounded-lg bg-secondary/40 border border-border/50">
                            <span className="h-3 w-3 rounded-full bg-green-500 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.modelCount} models</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Plan Distribution</CardTitle>
                      <CardDescription>Free vs Pro users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Free</span>
                            <span className="font-medium">{s.freeUsers}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(s.freeUsers / Math.max(s.totalUsers, 1)) * 100}%` }}
                              className="h-full rounded-full bg-primary"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Pro</span>
                            <span className="font-medium">{s.proUsers}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(s.proUsers / Math.max(s.totalUsers, 1)) * 100}%` }}
                              className="h-full rounded-full bg-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">User Management</CardTitle>
                        <CardDescription>{s.totalUsers} registered users</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search by name or email..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-56 h-9 text-sm"
                        />
                        <select
                          value={sort}
                          onChange={(e) => setSort(e.target.value)}
                          className="h-9 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">User</th>
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Plan</th>
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Projects</th>
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Tokens Today</th>
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Total Tokens</th>
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                                {search ? 'No users match your search.' : 'No users found.'}
                              </td>
                            </tr>
                          )}
                          {filteredUsers.map((user, i) => (
                            <motion.tr
                              key={user.uid}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.01 }}
                              className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {(user.displayName || user.email)[0].toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{user.displayName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge variant={user.planType === 'pro' ? 'default' : 'secondary'} className="text-[10px]">
                                  {user.planType}
                                </Badge>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="text-sm text-foreground">{user.projectCount}</span>
                              </td>
                              <td className="p-3 min-w-[120px]">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono text-foreground shrink-0 w-14">{user.tokensUsedToday.toLocaleString()}</span>
                                  <TokenBar used={user.tokensUsedToday} max={s.dailyLimit} />
                                </div>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="text-sm font-mono text-foreground">
                                  {user.totalTokensConsumed >= 1000000
                                    ? `${(user.totalTokensConsumed / 1000000).toFixed(1)}M`
                                    : user.totalTokensConsumed >= 1000
                                      ? `${(user.totalTokensConsumed / 1000).toFixed(1)}k`
                                      : user.totalTokensConsumed}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {user.isActiveToday && <span className="h-2 w-2 rounded-full bg-green-500" />}
                                  <span className="text-xs text-muted-foreground">{user.lastLoginRelative}</span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Platform Activity</CardTitle>
                    <CardDescription>Last 20 AI generations across all projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.recentActivity.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {data.recentActivity.map((act, i) => (
                          <motion.div
                            key={`${act.projectId}-${i}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30"
                          >
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-foreground line-clamp-2">{act.content}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-muted-foreground font-mono">{act.tokensUsed} tokens</span>
                                <RelativeTime iso={act.timestamp} />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="providers">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {data.providers.map((p, i) => (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{p.name}</CardTitle>
                            <span className="h-3 w-3 rounded-full bg-green-500" />
                          </div>
                          <CardDescription>Operational</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Models Available</span>
                            <span className="font-medium">{p.modelCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant="success" className="text-[10px]">Connected</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Fallback Chain</span>
                            <span className="text-muted-foreground">
                              {i === 0 ? 'Primary' : i === 1 ? 'Secondary' : 'Tertiary'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
