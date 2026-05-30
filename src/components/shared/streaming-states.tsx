'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface AIStreamingIndicatorProps {
  isStreaming: boolean;
  provider?: string;
  tokenCount?: number;
  onCancel?: () => void;
}

export function AIStreamingIndicator({ isStreaming, provider, tokenCount, onCancel }: AIStreamingIndicatorProps) {
  return (
    <AnimatePresence>
      {isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/10 rounded-lg"
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-primary font-medium">Generating</span>
          {provider && (
            <span className="text-xs text-muted-foreground">via {provider}</span>
          )}
          {tokenCount !== undefined && (
            <span className="text-xs text-muted-foreground">{tokenCount} tokens</span>
          )}
          <div className="flex-1" />
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AIFallbackNotificationProps {
  visible: boolean;
  from?: string;
  to?: string;
  timeRemaining?: number;
  onAccept?: () => void;
  onCancel?: () => void;
}

export function AIFallbackNotification({
  visible,
  from = 'unknown',
  to = 'unknown',
  timeRemaining = 5,
  onAccept,
  onCancel,
}: AIFallbackNotificationProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-3"
        >
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Switched to fallback model
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {from} → {to} · Reverting in {timeRemaining}s
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onAccept}
                className="text-xs px-2.5 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-500 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={onCancel}
                className="text-xs px-2.5 py-1.5 rounded border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="mt-2 h-1 w-full bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: timeRemaining, ease: 'linear' as const }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CountdownFallbackNotificationProps {
  visible: boolean;
  fromModel: string;
  toModel: string;
  reason: string;
  countdown: number;
  onSwitchNow: () => void;
  onCancel: () => void;
}

export function CountdownFallbackNotification({
  visible,
  fromModel,
  toModel,
  reason,
  countdown,
  onSwitchNow,
  onCancel,
}: CountdownFallbackNotificationProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-3"
        >
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {reason}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Switching to <strong>{toModel}</strong> in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}...
              </p>
              {countdown <= 3 && countdown > 0 && (
                <div className="flex gap-0.5 mt-2">
                  {Array.from({ length: countdown }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 flex-1 rounded-full bg-amber-500"
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onSwitchNow}
                className="text-xs px-2.5 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-500 transition-colors whitespace-nowrap"
              >
                Switch Now
              </button>
              <button
                onClick={onCancel}
                className="text-xs px-2.5 py-1.5 rounded border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="mt-2 h-1 w-full bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: countdown, ease: 'linear' as const }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PartialOutputNotificationProps {
  visible: boolean;
  tokenCount: number;
}

export function PartialOutputNotification({ visible, tokenCount }: PartialOutputNotificationProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-xs text-blue-700 dark:text-blue-400"
        >
          Response interrupted after {tokenCount} tokens. Switching models...
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AIErrorNotificationProps {
  error: string | null;
  onClose?: () => void;
}

export function AIErrorNotification({ error, onClose }: AIErrorNotificationProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3"
        >
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Provider Error
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5 break-words">
                {error}
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="shrink-0 h-6 w-6 rounded flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                aria-label="Dismiss error notification"
              >
                <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AIProviderStatusProps {
  provider: string;
  status: 'active' | 'fallback' | 'error';
  latency?: string;
}

export function AIProviderStatus({ provider, status, latency }: AIProviderStatusProps) {
  const colors = {
    active: 'bg-green-500',
    fallback: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${colors[status]}`} />
      <span>{provider}</span>
      {latency && <span>{latency}</span>}
    </div>
  );
}

interface TokenWarningBarProps {
  used: number;
  limit: number;
  showLabel?: boolean;
}

export function TokenWarningBar({ used, limit, showLabel = true }: TokenWarningBarProps) {
  const pct = Math.min((used / limit) * 100, 100);
  const isWarning = pct >= 80;
  const isCritical = pct >= 100;

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className={`${isCritical ? 'text-destructive' : isWarning ? 'text-warning' : 'text-muted-foreground'}`}>
            {used.toLocaleString()} / {limit.toLocaleString()} tokens
          </span>
          <span className={`${isCritical ? 'text-destructive' : isWarning ? 'text-warning' : 'text-muted-foreground'}`}>
            {pct.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isCritical ? 'bg-destructive' : isWarning ? 'bg-warning' : 'bg-primary'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        />
      </div>
    </div>
  );
}
