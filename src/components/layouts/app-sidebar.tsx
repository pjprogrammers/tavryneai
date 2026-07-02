'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationCenter } from '@/components/shared/notification-center';

const navItems = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Dashboard', href: '/dashboard', icon: 'grid' },
  { label: 'Analytics', href: '/analytics', icon: 'chart' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

const icons: Record<string, React.ReactNode> = {
  home: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  grid: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  chart: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  settings: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  shield: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

export function AppSidebar({ adminPath = 'admin' }: { adminPath?: string }) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin === true;
  const adminHref = `/${adminPath}`;

  // Project workbench is full-screen — hide the app sidebar on it
  if (pathname?.startsWith('/projects/')) {
    return null;
  }

  return (
    <>
      <aside className="hidden md:flex flex-col w-56 xl:w-60 border-r border-border bg-sidebar shrink-0" aria-label="Primary">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <Link href="/" className="flex items-center gap-2" aria-label="Tavryne AI home">
            <img src="/icon-32x32.png" alt="" aria-hidden="true" className="h-7 w-7 rounded-lg" />
            <span className="text-sm font-semibold text-foreground">TavryneAI</span>
          </Link>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1" aria-label="Main">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <span aria-hidden="true">{icons[item.icon]}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-3 py-3 border-t border-border">
          <Link
            href="/settings"
            aria-label={`Open settings for ${user?.displayName || 'user'}`}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Avatar
              src={user?.avatarUrl || null}
              fallback={user?.displayName?.charAt(0)?.toUpperCase() || '?'}
              size="sm"
              alt={user?.displayName || 'User'}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </Link>
        </div>

        {isAdmin && (
          <div className="py-3 px-2 space-y-1 border-t border-border">
            <Link
              href={adminHref}
              aria-current={pathname.startsWith(adminHref) ? 'page' : undefined}
              aria-label="Admin panel"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                pathname.startsWith(adminHref)
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <span aria-hidden="true">{icons.shield}</span>
              Admin
            </Link>
          </div>
        )}
      </aside>

      {/* Mobile & tablet bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-center justify-around px-2 py-2 safe-area-pb"
        aria-label="Primary mobile"
      >
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span aria-hidden="true">{icons[item.icon]}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
