import * as React from 'react';

import { cn } from '@/lib/utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'warning' | 'critical';
}

function Progress({ className, value, max = 100, variant = 'default', ...props }: ProgressProps) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor =
    variant === 'critical' ? 'bg-destructive' :
    variant === 'warning' ? 'bg-warning' :
    'bg-primary';

  return (
    <div
      className={cn('h-2 w-full bg-secondary rounded-full overflow-hidden', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500 ease-out', barColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };
