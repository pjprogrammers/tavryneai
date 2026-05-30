'use client';

export function TerminalBubble({
  command,
  output,
  exitCode,
}: {
  command: string;
  output: string;
  exitCode?: number;
}) {
  const isRunning = exitCode === undefined;
  const isSuccess = exitCode === 0;
  const isError = exitCode !== undefined && exitCode !== 0;

  return (
    <div className="my-1.5 rounded-lg border border-border/50 bg-[#0d0d0d] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-muted/30">
        <span className="text-sm">{isRunning ? '⚙️' : isSuccess ? '✅' : '❌'}</span>
        <span className="text-[10px] font-mono text-muted-foreground truncate flex-1">{command}</span>
        {isRunning && <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />}
        {exitCode !== undefined && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            isSuccess ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}>
            Exit {exitCode}
          </span>
        )}
      </div>
      {output && (
        <div className="p-3 text-[11px] font-mono leading-relaxed text-green-400 dark:text-green-300 whitespace-pre-wrap">
          {output}
        </div>
      )}
    </div>
  );
}
