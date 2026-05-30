'use client';
import { useCallback, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Avatar } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = useCallback(async () => {
    await logout();
    fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' }).catch(() => {});
    router.push('/');
  }, [logout, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const toggle = () => setOpen((prev) => !prev);

  if (user) {
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggle}
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <Avatar
            src={user.avatarUrl || null}
            fallback={user.displayName?.charAt(0)?.toUpperCase() || '?'}
            size="sm"
          />
          <span className="hidden sm:inline text-sm text-foreground max-w-[100px] truncate">
            {user.displayName}
          </span>
        </button>

        {open && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-popover shadow-lg z-50"
            role="menu"
          >
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">{user.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="py-1">
              <Link href="/settings" className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors" role="menuitem" onClick={() => setOpen(false)}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Profile
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors" role="menuitem" onClick={() => setOpen(false)}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Dashboard
              </Link>
            </div>
            <div className="border-t border-border py-1">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive hover:bg-accent transition-colors" role="menuitem">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className="hidden sm:inline-flex">
        <Button variant="ghost" size="sm" className="text-sm">Sign In</Button>
      </Link>
      <Link href="/register">
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">Start Building Free</Button>
      </Link>
    </div>
  );
}
