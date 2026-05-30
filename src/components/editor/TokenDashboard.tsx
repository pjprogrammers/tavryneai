'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTokenUsage } from '@/lib/hooks/useTokenUsage';
import { TokenWarningBar } from '@/components/shared/streaming-states';
import { Coins, ChevronDown, MessageSquare, FileJson, Wrench, FileText } from 'lucide-react';

interface TokenDashboardProps {
  inputTokens?: number;
  outputTokens?: number;
  contextTokens?: number;
  systemTokens?: number;
}

export function TokenDashboard({ inputTokens, outputTokens, contextTokens, systemTokens }: TokenDashboardProps) {
  const [expanded, setExpanded] = useState(false);
  const { usage, percentage, isWarning, isCritical } = useTokenUsage();

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-md transition-colors ${
          expanded ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Coins className="h-3 w-3" />
        <span className={`font-medium ${isCritical ? 'text-destructive' : isWarning ? 'text-warning' : ''}`}>
          {usage?.tokensUsedToday?.toLocaleString() || 0}
        </span>
        <span className="text-muted-foreground">/ {usage?.dailyLimit?.toLocaleString() || 10000}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-xl z-50 p-3"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Token Usage</span>
                <span className="text-[10px] text-muted-foreground">{percentage?.toFixed(0)}%</span>
              </div>
              <TokenWarningBar
                used={usage?.tokensUsedToday || 0}
                limit={usage?.dailyLimit || 10000}
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="h-3 w-3" /> Conversation
                  </span>
                  <span className="font-medium text-foreground">{inputTokens?.toLocaleString() || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <FileJson className="h-3 w-3" /> File Context
                  </span>
                  <span className="font-medium text-foreground">{contextTokens?.toLocaleString() || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-3 w-3" /> System Prompt
                  </span>
                  <span className="font-medium text-foreground">{systemTokens?.toLocaleString() || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Wrench className="h-3 w-3" /> Tool Calls
                  </span>
                  <span className="font-medium text-foreground">{outputTokens?.toLocaleString() || '—'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className={`font-medium ${isCritical ? 'text-destructive' : isWarning ? 'text-warning' : 'text-green-500'}`}>
                    {usage?.remaining?.toLocaleString() || 10000}
                  </span>
                </div>
                {usage?.resetTime && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Resets {new Date(usage.resetTime).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
