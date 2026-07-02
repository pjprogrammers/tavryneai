'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const typeIcons: Record<string, React.ReactNode> = {
  success: (
    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  warning: (
    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
      <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
  ),
  error: (
    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
      <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  ),
  info: (
    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
};

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const idToken = useAuthStore((s) => s.idToken);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/notifications?limit=20', {
        headers: { Authorization: `Bearer ${idToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onOpenChange(false)} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 origin-top-right"
          >
            <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-4 border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-primary/[0.02]' : ''
                      }`}
                    >
                      {typeIcons[notification.type] || typeIcons.info}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.read ? 'text-foreground' : 'text-foreground font-medium'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{notification.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatRelativeTime(new Date(notification.createdAt))}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
