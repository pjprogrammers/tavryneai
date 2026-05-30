'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/store/useProjectStore';

interface StaticSearchItem {
  id: string;
  title: string;
  description?: string;
  path: string;
  category: string;
}

const STATIC_ITEMS: StaticSearchItem[] = [
  { id: 'page-dashboard', title: 'Dashboard', path: '/dashboard', category: 'Pages' },
  { id: 'page-settings', title: 'Settings', path: '/settings', category: 'Pages' },
  { id: 'page-profile', title: 'Profile', path: '/settings?tab=profile', category: 'Pages' },
  { id: 'page-billing', title: 'Billing', path: '/settings?tab=billing', category: 'Pages' },
  { id: 'page-analytics', title: 'Usage Analytics', path: '/analytics', category: 'Pages' },
  { id: 'page-api-keys', title: 'API Keys', path: '/settings?tab=api-keys', category: 'Pages' },
  { id: 'page-admin', title: 'Admin Dashboard', path: '/admin', category: 'Pages' },
  { id: 'page-notifications', title: 'Notifications', path: '/notifications', category: 'Pages' },
  { id: 'action-new-project', title: 'New Project', path: '/dashboard?new=true', category: 'Actions' },
];

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const projects = useProjectStore((s) => s.projects);

  const projectItems = useMemo(() => {
    return projects
      .filter((p) => p.status === 'active')
      .map((p) => ({
        id: `project-${p.id}`,
        title: p.title,
        description: p.description || p.framework,
        path: `/projects/${p.id}`,
        category: 'Projects' as const,
      }));
  }, [projects]);

  const allItems = useMemo(() => [...projectItems, ...STATIC_ITEMS], [projectItems]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]);
    }
  };

  const handleSelect = (item: typeof allItems[0]) => {
    if (item.path) {
      router.push(item.path);
    }
    onOpenChange(false);
  };

  const categories = useMemo(() => {
    const cats = new Map<string, typeof allItems>();
    for (const item of filtered) {
      const list = cats.get(item.category) || [];
      list.push(item);
      cats.set(item.category, list);
    }
    return Array.from(cats.entries());
  }, [filtered]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 z-50 w-full max-w-lg mx-4"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-3 border-b border-border">
                <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search projects, pages, settings..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  ESC
                </kbd>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <>
                    {categories.map(([category, items]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <span>{category}</span>
                          <span className="text-[10px] text-muted-foreground/50">({items.length})</span>
                        </div>
                        {items.map((item) => {
                          const idx = filtered.indexOf(item);
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelect(item)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                idx === selectedIndex
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-foreground hover:bg-secondary'
                              }`}
                            >
                              <div className="flex-1 text-left min-w-0">
                                <div className="text-sm truncate">{item.title}</div>
                                {item.description && (
                                  <div className="text-[10px] text-muted-foreground truncate">{item.description}</div>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground shrink-0">{category === 'Projects' ? 'Project' : category}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 p-3 border-t border-border">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-secondary px-1 py-0.5">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-secondary px-1 py-0.5">↵</kbd>
                  <span>Open</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                  <kbd className="rounded border border-border bg-secondary px-1 py-0.5">⌘K</kbd>
                  <span>Toggle</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
