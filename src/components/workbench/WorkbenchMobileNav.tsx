'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  FolderTree,
  Code2,
  PlayCircle,
  GitCompare,
  Terminal as TerminalIcon,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useEditorStore } from '@/lib/store/useEditorStore';

export type WorkbenchTab = 'chat' | 'files' | 'code' | 'preview' | 'diff' | 'terminal';

interface WorkbenchMobileNavProps {
  active: WorkbenchTab;
  onChange: (tab: WorkbenchTab) => void;
  fileCount: number;
}

const tabs: { id: WorkbenchTab; label: string; icon: typeof MessageSquare }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: FolderTree },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'preview', label: 'Preview', icon: PlayCircle },
  { id: 'diff', label: 'Changes', icon: GitCompare },
];

export function WorkbenchMobileNav({
  active,
  onChange,
  fileCount,
}: WorkbenchMobileNavProps) {
  const pendingDiffs = useEditorStore((s) => s.pendingDiffs);
  const diffCount = pendingDiffs.filter((d) => d.status === 'pending').length;

  return (
    <nav
      className="md:hidden fixed bottom-2 inset-x-2 z-40 safe-pb"
      aria-label="Workbench navigation"
    >
      <div className="wb-glass rounded-2xl px-1.5 py-1.5 flex items-center justify-between gap-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          const badge =
            t.id === 'files' ? fileCount : t.id === 'diff' ? diffCount : 0;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 wb-press transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={t.label}
            >
              {isActive && (
                <motion.span
                  layoutId="wb-mobnav-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative flex items-center justify-center">
                <Icon className="h-4 w-4" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
              <span className="relative text-[10px] font-medium leading-none">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
