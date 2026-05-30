'use client';
import { useTokenUsage } from '@/lib/hooks/useTokenUsage';
import { TokenWarningBar } from '@/components/shared/streaming-states';
import { motion, AnimatePresence } from 'framer-motion';

export function TokenCounter() {
  const { usage, percentage, isWarning, isCritical } = useTokenUsage();

  return (
    <div className="flex items-center gap-2 px-2">
      <div className="w-20 sm:w-24">
        <TokenWarningBar used={usage.tokensUsedToday} limit={usage.dailyLimit} showLabel={false} />
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={isCritical ? 'critical' : isWarning ? 'warning' : 'normal'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-[10px] font-medium ${
            isCritical ? 'text-destructive' : isWarning ? 'text-warning' : 'text-muted-foreground'
          }`}
        >
          {usage.tokensUsedToday.toLocaleString()}
          <span className="hidden sm:inline"> / {usage.dailyLimit.toLocaleString()}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
