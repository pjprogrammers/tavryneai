'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortcutGroup {
  category: string;
  shortcuts: { keys: string; label: string }[];
}

const DEFAULT_SHORTCUTS: ShortcutGroup[] = [
  {
    category: 'General',
    shortcuts: [
      { keys: '⌘K', label: 'Command palette' },
      { keys: '⌘?', label: 'Keyboard shortcuts' },
      { keys: 'Escape', label: 'Close overlay / Cancel' },
    ],
  },
  {
    category: 'Editor',
    shortcuts: [
      { keys: '⌘S', label: 'Save file' },
      { keys: '⌘Z', label: 'Undo' },
      { keys: '⌘⇧Z', label: 'Redo' },
      { keys: '⌘⇧F', label: 'Search across files' },
      { keys: '⌫', label: 'Delete line' },
      { keys: '⌘⇧K', label: 'Delete line (alt)' },
      { keys: '⌘D', label: 'Select next match' },
    ],
  },
  {
    category: 'Chat',
    shortcuts: [
      { keys: 'Enter', label: 'Send message' },
      { keys: '⇧Enter', label: 'New line in prompt' },
    ],
  },
  {
    category: 'View',
    shortcuts: [
      { keys: '⌘1', label: 'Toggle chat panel' },
      { keys: '⌘2', label: 'Toggle preview panel' },
      { keys: '⌘3', label: 'Toggle file explorer' },
      { keys: '⌘4', label: 'Toggle bottom panel' },
      { keys: '⌘\\', label: 'Toggle terminal' },
      { keys: '⌘⇧T', label: 'Toggle agent timeline' },
    ],
  },
  {
    category: 'Navigation',
    shortcuts: [
      { keys: '⌘⇧E', label: 'Focus file tree' },
      { keys: '⌘⇧P', label: 'Focus chat input' },
      { keys: '⌘⇧G', label: 'Open changes panel' },
      { keys: '⌘⇧L', label: 'Focus search' },
    ],
  },
];

export function KeyboardShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '/') {
      e.preventDefault();
      setOpen((p) => !p);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5 space-y-5">
                {DEFAULT_SHORTCUTS.map((group) => (
                  <div key={group.category}>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      {group.category}
                    </h3>
                    <div className="space-y-1">
                      {group.shortcuts.map((shortcut) => (
                        <div key={shortcut.keys} className="flex items-center justify-between py-1">
                          <span className="text-xs text-foreground">{shortcut.label}</span>
                          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono border border-border/50">
                            {shortcut.keys}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground text-center">
                  Press <kbd className="px-1 py-0.5 rounded bg-secondary text-muted-foreground font-mono border border-border/50">⌘⇧/</kbd> to toggle this panel
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
