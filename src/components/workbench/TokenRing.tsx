'use client';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTokenUsage } from '@/lib/hooks/useTokenUsage';
import { Coins, Sparkles } from 'lucide-react';

interface TokenRingProps {
  size?: number;
  stroke?: number;
  showLabel?: boolean;
  onClick?: () => void;
}

/**
 * Animated 3D-feel token ring with conic gradient stroke.
 * Used in the topbar, topbar mobile, and mobile nav badge.
 */
export function TokenRing({
  size = 36,
  stroke = 4,
  showLabel = false,
  onClick,
}: TokenRingProps) {
  const { usage, percentage, isWarning, isCritical } = useTokenUsage();
  const pct = Math.min(percentage ?? 0, 100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  const tone = isCritical
    ? { from: '#f87171', to: '#ef4444', glow: 'rgba(239,68,68,0.45)' }
    : isWarning
    ? { from: '#fbbf24', to: '#f59e0b', glow: 'rgba(245,158,11,0.4)' }
    : { from: 'hsl(var(--primary))', to: '#7c3aed', glow: 'hsl(var(--primary) / 0.4)' };

  const dash = useMemo(() => `${c} ${c}`, [c]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 rounded-full p-1 transition-transform wb-press"
      title={`${usage?.tokensUsedToday?.toLocaleString() ?? 0} / ${usage?.dailyLimit?.toLocaleString() ?? 10000} tokens`}
    >
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Soft glow */}
        <div
          className="absolute inset-0 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: tone.glow }}
          aria-hidden
        />
        <svg width={size} height={size} className="relative -rotate-90">
          <defs>
            <linearGradient id="wb-ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={tone.from} />
              <stop offset="100%" stopColor={tone.to} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="hsl(var(--wb-border-soft) / 0.7)"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#wb-ring-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={dash}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-foreground/90"
          aria-hidden
        >
          {isCritical ? (
            <Sparkles className="h-3 w-3" />
          ) : (
            <Coins className="h-3 w-3" />
          )}
        </div>
      </div>
      <AnimatePresence>
        {showLabel && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            className={`text-[11px] font-medium tabular-nums ${
              isCritical
                ? 'text-destructive'
                : isWarning
                ? 'text-warning'
                : 'text-muted-foreground'
            }`}
          >
            {(usage?.tokensUsedToday ?? 0).toLocaleString()}
            <span className="text-muted-foreground/60">
              /{(usage?.dailyLimit ?? 10000).toLocaleString()}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
