'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useTokenUsage } from '@/lib/hooks/useTokenUsage';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { NewProjectDialog } from '@/components/dashboard/NewProjectDialog';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LoadingState } from '@/components/shared/loading-state';
import { TokenWarningBar } from '@/components/shared/streaming-states';
import type { ReactNode } from 'react';

const SearchOverlay = dynamic(() =>
  import('@/components/shared/search-overlay').then((m) => ({ default: m.SearchOverlay })),
  { ssr: false }
);

const NotificationCenter = dynamic(() =>
  import('@/components/shared/notification-center').then((m) => ({ default: m.NotificationCenter })),
  { ssr: false }
);

export function DashboardView({ adminButton }: { adminButton?: ReactNode }) {
  const { user, logout } = useAuthStore();
  const { projects, loading, loadProjects } = useProjectStore();
  const { usage } = useTokenUsage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadProjects(user.uid);
    }
  }, [user?.uid, loadProjects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.framework?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back{user ? `, ${user.displayName}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Continue where you left off or start something new.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <TokenWarningBar used={usage.tokensUsedToday} limit={usage.dailyLimit} />
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-secondary/50 rounded-lg border border-border/50 hover:bg-secondary transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
              <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">⌘K</kbd>
            </button>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors relative"
                aria-label="Open notifications"
              >
                <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              {notifOpen && <NotificationCenter open={notifOpen} onOpenChange={setNotifOpen} />}
            </div>
            {adminButton}
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Token bar mobile */}
        <div className="sm:hidden mb-6">
          <TokenWarningBar used={usage.tokensUsedToday} limit={usage.dailyLimit} />
        </div>

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          <Button
            onClick={() => setNewProjectOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 text-base rounded-xl shadow-lg shadow-primary/25"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
          <div className="flex-1" />
          <div className="relative max-w-xs w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, description or framework..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <LoadingState type="card" count={6} />
        ) : (
          <ProjectGrid projects={filteredProjects} onCreateProject={() => setNewProjectOpen(true)} />
        )}
      </div>

      <NewProjectDialog open={newProjectOpen} onOpenChange={setNewProjectOpen} />

      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
