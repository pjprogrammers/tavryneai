'use client';
import type { AgentSummaryEvent } from '@/lib/types/ai';

export function AgentSummary({ data }: { data: AgentSummaryEvent }) {
  return (
    <div className="my-2 rounded-lg border border-border/50 bg-secondary/20 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <span className="text-sm">✅</span>
        <span className="text-xs font-medium text-foreground">Completed</span>
      </div>

      <div className="p-3 space-y-2">
        <p className="text-xs text-foreground leading-relaxed">{data.message}</p>

        {data.filesModified.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1">Files Modified</p>
            <div className="space-y-0.5">
              {data.filesModified.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-medium ${
                    f.action === 'create' ? 'text-emerald-500' : f.action === 'delete' ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    {f.action === 'create' ? '+' : f.action === 'delete' ? '-' : '~'}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">{f.path}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.changes.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1">Changes Made</p>
            <ul className="space-y-0.5">
              {data.changes.map((c, i) => (
                <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.verification.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1">Verification</p>
            <div className="space-y-0.5">
              {data.verification.map((v, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className={v.passed ? 'text-emerald-500' : 'text-red-500'}>
                    {v.passed ? '✓' : '✗'}
                  </span>
                  <span className={`text-[11px] ${v.passed ? 'text-muted-foreground' : 'text-red-500'}`}>
                    {v.name}
                  </span>
                  {v.output && (
                    <span className="text-[10px] text-muted-foreground truncate ml-1">{v.output}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
