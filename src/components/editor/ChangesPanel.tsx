'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore, FileDiff } from '@/lib/store/useEditorStore';
import { Check, X, FileCode, GitCompare } from 'lucide-react';

interface ChangesPanelProps {
  visible: boolean;
  onClose?: () => void;
}

function DiffPreview({ diff }: { diff: FileDiff }) {
  const oldLines = diff.oldContent.split('\n');
  const newLines = diff.newContent.split('\n');
  const maxLines = Math.max(oldLines.length, newLines.length);

  return (
    <div className="font-mono text-[10px] leading-relaxed max-h-[200px] overflow-y-auto rounded bg-background/50 p-1.5">
      {Array.from({ length: Math.min(maxLines, 30) }).map((_, i) => {
        const oldLine = oldLines[i];
        const newLine = newLines[i];
        if (oldLine === newLine && oldLine !== undefined) {
          return <div key={i} className="text-muted-foreground px-2">{oldLine}</div>;
        }
        return (
          <div key={i}>
            {oldLine !== undefined && (
              <div className="bg-red-500/10 text-red-600 dark:text-red-400 px-2 line-through">-{oldLine}</div>
            )}
            {newLine !== undefined && (
              <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-2">+{newLine}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ChangesPanel({ visible, onClose }: ChangesPanelProps) {
  const { pendingDiffs, acceptDiff, rejectDiff, acceptAllDiffs, rejectAllDiffs } = useEditorStore();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="h-full bg-card border-l border-border flex flex-col"
        >
          <div className="flex items-center justify-between px-3 h-9 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-1.5">
              <GitCompare className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Changes
              </span>
              {pendingDiffs.length > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary font-medium px-1 rounded">
                  {pendingDiffs.length}
                </span>
              )}
            </div>
            {onClose && (
              <button onClick={onClose} className="h-5 w-5 rounded flex items-center justify-center hover:bg-secondary transition-colors">
                <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {pendingDiffs.length === 0 && (
              <div className="text-center py-8">
                <FileCode className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No pending changes</p>
              </div>
            )}

            {pendingDiffs.filter((d) => d.status === 'pending').length > 1 && (
              <div className="flex gap-1 px-1">
                <button
                  onClick={acceptAllDiffs}
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <Check className="h-3 w-3" /> Accept All
                </button>
                <button
                  onClick={rejectAllDiffs}
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <X className="h-3 w-3" /> Reject All
                </button>
              </div>
            )}

            {pendingDiffs.map((diff) => (
              <div
                key={diff.filename}
                className={`rounded-lg border p-2 ${
                  diff.status === 'accepted'
                    ? 'border-green-500/30 bg-green-500/5'
                    : diff.status === 'rejected'
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-border bg-card/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-foreground truncate flex-1 min-w-0">
                    {diff.filename}
                  </span>
                  <span className={`text-[10px] font-medium ml-2 ${
                    diff.status === 'accepted' ? 'text-green-500' :
                    diff.status === 'rejected' ? 'text-red-500' :
                    'text-muted-foreground'
                  }`}>
                    {diff.status === 'pending' ? 'Pending' : diff.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </span>
                </div>

                <DiffPreview diff={diff} />

                {diff.status === 'pending' && (
                  <div className="flex gap-1 mt-1.5">
                    <button
                      onClick={() => acceptDiff(diff.filename)}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                      <Check className="h-3 w-3" /> Accept
                    </button>
                    <button
                      onClick={() => rejectDiff(diff.filename)}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <X className="h-3 w-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
