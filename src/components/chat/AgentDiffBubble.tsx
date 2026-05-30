'use client';
import type { AgentDiffEvent } from '@/lib/types/ai';

function computeDiffLines(oldContent: string, newContent: string) {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const maxLen = Math.max(oldLines.length, newLines.length);
  const result: { type: 'same' | 'add' | 'remove'; text: string }[] = [];

  for (let i = 0; i < maxLen; i++) {
    if (i >= oldLines.length) {
      result.push({ type: 'add', text: newLines[i] });
    } else if (i >= newLines.length) {
      result.push({ type: 'remove', text: oldLines[i] });
    } else if (oldLines[i] === newLines[i]) {
      result.push({ type: 'same', text: oldLines[i] });
    } else {
      result.push({ type: 'remove', text: oldLines[i] });
      result.push({ type: 'add', text: newLines[i] });
    }
  }
  return result;
}

export function AgentDiffBubble({ file, oldContent, newContent, action }: AgentDiffEvent) {
  const hasDiff = oldContent !== undefined && newContent !== undefined;
  const diffLines = hasDiff ? computeDiffLines(oldContent || '', newContent || '') : [];

  if (!hasDiff) {
    return (
      <div className="my-1.5 rounded-lg border border-border/50 bg-secondary/20">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50">
          <span className="text-xs font-mono text-foreground font-medium">{file}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            action === 'create' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : action === 'delete' ? 'bg-red-500/15 text-red-600 dark:text-red-400'
            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          }`}>
            {action === 'create' ? '+ Created' : action === 'delete' ? '- Deleted' : '~ Modified'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-1.5 rounded-lg border border-border/50 bg-secondary/20 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-muted/30">
        <span className="text-xs font-mono text-foreground font-medium flex-1 truncate">{file}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
          action === 'create' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          : action === 'delete' ? 'bg-red-500/15 text-red-600 dark:text-red-400'
          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
        }`}>
          {action === 'create' ? '+ Created' : action === 'delete' ? '- Deleted' : '~ Modified'}
        </span>
      </div>
      <div className="text-[11px] font-mono leading-relaxed p-0 overflow-x-auto">
        {diffLines.map((line, i) => (
          <div
            key={i}
            className={`px-3 py-0.5 whitespace-pre ${
              line.type === 'add' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : line.type === 'remove' ? 'bg-red-500/10 text-red-700 dark:text-red-300'
              : 'text-muted-foreground'
            }`}
          >
            <span className="select-none w-4 inline-block shrink-0">
              {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
            </span>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
