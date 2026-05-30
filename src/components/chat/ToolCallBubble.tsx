'use client';

const TOOL_META: Record<string, { icon: string; label: string; border: string; bg: string }> = {
  read_file: { icon: '📖', label: 'Reading', border: 'border-l-cyan-500', bg: 'bg-cyan-500/5' },
  write_file: { icon: '✏️', label: 'Writing', border: 'border-l-amber-500', bg: 'bg-amber-500/5' },
  edit_file: { icon: '✏️', label: 'Editing', border: 'border-l-amber-500', bg: 'bg-amber-500/5' },
  create_file: { icon: '📝', label: 'Creating', border: 'border-l-emerald-500', bg: 'bg-emerald-500/5' },
  delete_file: { icon: '🗑️', label: 'Deleting', border: 'border-l-red-500', bg: 'bg-red-500/5' },
  search: { icon: '🔎', label: 'Searching', border: 'border-l-violet-500', bg: 'bg-violet-500/5' },
  run_command: { icon: '⚙️', label: 'Running', border: 'border-l-orange-500', bg: 'bg-orange-500/5' },
};

export function ToolCallBubble({
  tool,
  file,
  description,
}: {
  tool: string;
  file?: string;
  description?: string;
}) {
  const meta = TOOL_META[tool] || { icon: '🔧', label: 'Processing', border: 'border-l-gray-500', bg: 'bg-gray-500/5' };

  return (
    <div className={`my-1.5 rounded-lg border border-l-4 ${meta.border} ${meta.bg} border-border/50`}>
      <div className="flex items-center gap-2 px-3 py-1.5">
        <span className="text-sm">{meta.icon}</span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
          {meta.label}
        </span>
        {file && (
          <span className="text-xs font-mono text-muted-foreground truncate flex-1">{file}</span>
        )}
        {description && !file && (
          <span className="text-xs text-muted-foreground truncate flex-1">{description}</span>
        )}
        <span className="h-2 w-2 rounded-full bg-primary/30 animate-pulse shrink-0" />
      </div>
    </div>
  );
}
