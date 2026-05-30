'use client';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePanelStore, BottomTab } from '@/lib/store/usePanelStore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { Terminal, ScrollText, GitCompare, Monitor } from 'lucide-react';
import { TerminalDrawer } from '@/components/shared/terminal-drawer';
import { ChangesPanel } from './ChangesPanel';

const tabs: { id: BottomTab; label: string; icon: typeof Terminal }[] = [
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'changes', label: 'Changes', icon: GitCompare },
  { id: 'console', label: 'Console', icon: Monitor },
];

export function BottomPanel() {
  const { bottomTab, bottomOpen, setBottomTab, setBottomOpen, bottomHeight } = usePanelStore();
  const pendingDiffs = useEditorStore((s) => s.pendingDiffs);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pendingCount = pendingDiffs.filter((d) => d.status === 'pending').length;

  return (
    <div className="border-t border-border bg-card">
      <div className="flex items-center justify-between px-2 h-8 shrink-0">
        <div className="flex items-center gap-0.5">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = bottomTab === id && bottomOpen;
            const count = id === 'changes' ? pendingCount : 0;
            return (
              <button
                key={id}
                onClick={() => {
                  if (isActive) {
                    setBottomOpen(false);
                  } else {
                    setBottomTab(id);
                    setBottomOpen(true);
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-colors relative ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
                {count > 0 && (
                  <span className="text-[10px] bg-primary/10 text-primary font-medium px-1 rounded">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {bottomOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: bottomHeight, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="h-full border-t border-border/50">
              {bottomTab === 'terminal' && (
                <TerminalDrawer
                  open={true}
                  onOpenChange={setBottomOpen}
                />
              )}
              {bottomTab === 'logs' && (
                <div className="h-full bg-[#0a0a0f] overflow-y-auto p-3 font-mono text-xs leading-5 space-y-0.5">
                  <p className="text-white/30">Log output will appear here.</p>
                </div>
              )}
              {bottomTab === 'changes' && (
                <div className="h-full overflow-y-auto">
                  <ChangesPanel visible={true} />
                </div>
              )}
              {bottomTab === 'console' && (
                <div className="h-full bg-[#0a0a0f] overflow-y-auto p-3 font-mono text-xs leading-5 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">{'>'}</span>
                    <span className="text-white/70">Console ready</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
