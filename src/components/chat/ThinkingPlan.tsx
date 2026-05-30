'use client';

interface AgentStep {
  status: 'pending' | 'running' | 'completed';
  title: string;
}

export function ThinkingPlan({ steps }: { steps: AgentStep[] }) {
  if (steps.length === 0) return null;

  const isAnimating = steps.some((s) => s.status === 'running');

  return (
    <div className={`my-2 rounded-lg border border-border/50 bg-secondary/20 overflow-hidden ${isAnimating ? 'animate-pulse' : ''}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <span className="text-sm">🧠</span>
        <span className="text-xs font-medium text-foreground">Plan</span>
      </div>
      <div className="p-2 space-y-0.5">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
              step.status === 'completed'
                ? 'text-green-600 dark:text-green-400'
                : step.status === 'running'
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
            }`}
          >
            {step.status === 'completed' ? (
              <span className="h-3.5 w-3.5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <svg className="h-2 w-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            ) : step.status === 'running' ? (
              <span className="h-3.5 w-3.5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </span>
            ) : (
              <span className="h-3.5 w-3.5 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
              </span>
            )}
            <span className="leading-relaxed">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
