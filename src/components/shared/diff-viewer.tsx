'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
}

interface DiffViewerProps {
  filename: string;
  oldContent: string;
  newContent: string;
  description?: string;
  onAccept?: () => void;
  onReject?: () => void;
}

function computeDiff(oldContent: string, newContent: string): DiffLine[] {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const ops = myersDiff(oldLines, newLines);
  const lines: DiffLine[] = [];
  let oldIdx = 1;
  let newIdx = 1;
  for (const op of ops) {
    if (op.type === 'equal') {
      for (let i = 0; i < op.count; i++) {
        lines.push({ type: 'unchanged', content: oldLines[oldIdx - 1 + i], lineNumber: oldIdx + i });
      }
      oldIdx += op.count;
      newIdx += op.count;
    } else if (op.type === 'delete') {
      for (let i = 0; i < op.count; i++) {
        lines.push({ type: 'removed', content: oldLines[oldIdx - 1 + i], lineNumber: oldIdx + i });
      }
      oldIdx += op.count;
    } else {
      for (let i = 0; i < op.count; i++) {
        lines.push({ type: 'added', content: newLines[newIdx - 1 + i], lineNumber: newIdx + i });
      }
      newIdx += op.count;
    }
  }
  return lines;
}

type DiffOp = { type: 'equal' | 'delete' | 'insert'; count: number };

function myersDiff(oldArr: string[], newArr: string[]): DiffOp[] {
  const n = oldArr.length;
  const m = newArr.length;
  const max = n + m;
  const v: number[] = new Array(2 * max + 1);
  const trace: number[][] = [];
  for (let d = 0; d <= max; d++) {
    trace.push([...v]);
    for (let k = -d; k <= d; k += 2) {
      const idx = k + max;
      const goDown = k === -d || (k !== d && v[idx - 1] < v[idx + 1]);
      let x = goDown ? v[idx + 1] : v[idx - 1] + 1;
      let y = x - k;
      while (x < n && y < m && oldArr[x] === newArr[y]) { x++; y++; }
      v[idx] = x;
      if (x >= n && y >= m) {
        return backtrack(oldArr, newArr, trace, max);
      }
    }
  }
  return [];
}

function backtrack(oldArr: string[], newArr: string[], trace: number[][], max: number): DiffOp[] {
  let x = oldArr.length;
  let y = newArr.length;
  const ops: DiffOp[] = [];
  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d];
    const k = x - y;
    const idx = k + max;
    const prevK = d === 0 ? 0 : (k === -d || (k !== d && v[idx - 1] < v[idx + 1]) ? k + 1 : k - 1);
    const prevIdx = prevK + max;
    const prevX = d === 0 ? 0 : v[prevIdx];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      ops.push({ type: 'equal', count: 1 });
      x--;
      y--;
    }
    if (d > 0) {
      if (x === prevX) {
        ops.push({ type: 'insert', count: y - prevY });
      } else {
        ops.push({ type: 'delete', count: x - prevX });
      }
    }
    x = prevX;
    y = prevY;
  }
  return ops.reverse();
}

function getFileAction(filename: string, oldContent: string, newContent: string): { label: string; color: string } {
  if (oldContent === '' && newContent !== '') return { label: 'Created', color: 'text-green-600 dark:text-green-400' };
  if (oldContent !== '' && newContent === '') return { label: 'Deleted', color: 'text-red-600 dark:text-red-400' };
  return { label: 'Modified', color: 'text-amber-600 dark:text-amber-400' };
}

export function DiffViewer({ filename, oldContent, newContent, description, onAccept, onReject }: DiffViewerProps) {
  const [expanded, setExpanded] = useState(true);
  const diff = computeDiff(oldContent, newContent);
  const changes = diff.filter((l) => l.type !== 'unchanged').length;
  const action = getFileAction(filename, oldContent, newContent);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-start justify-between px-3 py-2 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors min-w-0"
          >
            <svg className={`h-3 w-3 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="truncate">{filename}</span>
          </button>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${action.color} bg-current/10 shrink-0`}>
            {action.label}
          </span>
          {description && (
            <span className="text-[10px] text-muted-foreground hidden sm:inline truncate max-w-[200px]">— {description}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            <span className="text-green-600 dark:text-green-400">+{diff.filter((l) => l.type === 'added').length}</span>
            {' '}
            <span className="text-red-600 dark:text-red-400">-{diff.filter((l) => l.type === 'removed').length}</span>
          </span>
          <div className="flex items-center gap-1">
            {onAccept && (
              <button
                onClick={onAccept}
                className="text-[10px] px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-medium"
              >
                Accept
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                className="text-[10px] px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="font-mono text-xs leading-5 bg-background overflow-x-auto">
              {diff.slice(0, 80).map((line, i) => (
                <div
                  key={i}
                  className={`flex px-3 ${
                    line.type === 'added' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                    line.type === 'removed' ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
                    'text-muted-foreground hover:bg-secondary/30'
                  }`}
                >
                  <span className="w-7 text-right text-muted-foreground/40 shrink-0 mr-2 select-none">
                    {line.lineNumber}
                  </span>
                  <span className="w-3 shrink-0 select-none text-center">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ''}
                  </span>
                  <span className="flex-1 whitespace-pre pl-1">{line.content || ' '}</span>
                </div>
              ))}
              {diff.length > 80 && (
                <div className="px-3 py-2 text-[10px] text-muted-foreground text-center border-t border-border/50">
                  ... {diff.length - 80} more lines not shown
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type DiffItem = { filename: string; oldContent: string; newContent: string; description?: string };

interface DiffPanelProps {
  diffs: DiffItem[];
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onAcceptFile?: (filename: string) => void;
  onRejectFile?: (filename: string) => void;
}

export function DiffPanel({ diffs, onAcceptAll, onRejectAll, onAcceptFile, onRejectFile }: DiffPanelProps) {
  const [show, setShow] = useState(true);
  const totalAdded = diffs.reduce((s, d) => s + d.newContent.split('\n').length, 0);
  const totalRemoved = diffs.reduce((s, d) => s + d.oldContent.split('\n').length, 0);

  if (!show || diffs.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-56 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-foreground">Review Changes</h3>
          <span className="text-xs text-muted-foreground">{diffs.length} file{diffs.length !== 1 ? 's' : ''} changed</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            <span className="text-green-600 dark:text-green-400">+{totalAdded}</span>
            {' / '}
            <span className="text-red-600 dark:text-red-400">-{totalRemoved}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onRejectAll && (
            <button onClick={onRejectAll} className="text-xs px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-medium">
              Reject all
            </button>
          )}
          {onAcceptAll && (
            <button onClick={onAcceptAll} className="text-xs px-2.5 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
              Accept all
            </button>
          )}
          <button
            onClick={() => setShow(false)}
            className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close review panel"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto p-2 space-y-2">
        {diffs.map((d, i) => (
          <DiffViewer
            key={i}
            filename={d.filename}
            oldContent={d.oldContent}
            newContent={d.newContent}
            description={d.description}
            onAccept={onAcceptFile ? () => onAcceptFile(d.filename) : undefined}
            onReject={onRejectFile ? () => onRejectFile(d.filename) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
