'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { formatRelativeTime } from '@/lib/utils/helpers';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
}

const TYPE_STYLES: Record<string, { bg: string; icon: string; svg: string }> = {
  success: { bg: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', icon: '✓', svg: 'M5 13l4 4L19 7' },
  warning: { bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', icon: '!', svg: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
  error: { bg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', icon: '×', svg: 'M6 18L18 6M6 6l12 12' },
  info: { bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', icon: 'i', svg: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const idToken = useAuthStore((s) => s.idToken);

  const load = useCallback(async () => {
    if (!idToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/notifications?limit=100', {
        headers: { Authorization: `Bearer ${idToken}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load notifications');
      const data = await res.json();
      setNotifications(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    load();
  }, [load]);

  const markAllRead = async () => {
    if (!idToken) return;
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </motion.div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <div role="alert" className="p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                }
                title="No notifications"
                description={filter === 'unread' ? 'No unread notifications' : "You're all caught up"}
              />
            ) : (
              <ul className="divide-y divide-border/50">
                {filtered.map((notification) => {
                  const style = TYPE_STYLES[notification.type] || TYPE_STYLES.info;
                  return (
                    <li
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 transition-colors ${
                        !notification.read ? 'bg-primary/[0.02]' : ''
                      } hover:bg-secondary/30`}
                    >
                      <div
                        aria-hidden="true"
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.svg} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${notification.read ? 'text-foreground' : 'text-foreground font-medium'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span aria-label="Unread" className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                        <time
                          dateTime={notification.createdAt}
                          className="text-[10px] text-muted-foreground/60 mt-1 block"
                        >
                          {formatRelativeTime(new Date(notification.createdAt))}
                        </time>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
