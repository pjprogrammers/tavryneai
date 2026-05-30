'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, FileText, Code, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'read' | 'write' | 'edit' | 'build' | 'success' | 'error' | 'info';
  label: string;
  detail?: string;
}

interface AgentTimelineProps {
  events: TimelineEvent[];
  visible: boolean;
  onClose?: () => void;
}

const eventIcons = {
  read: FileText,
  write: Code,
  edit: Code,
  build: RefreshCw,
  success: CheckCircle,
  error: XCircle,
  info: AlertCircle,
};

const eventColors = {
  read: 'text-blue-500',
  write: 'text-emerald-500',
  edit: 'text-amber-500',
  build: 'text-purple-500',
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-muted-foreground',
};

const eventBgColors = {
  read: 'bg-blue-500/10 border-blue-500/20',
  write: 'bg-emerald-500/10 border-emerald-500/20',
  edit: 'bg-amber-500/10 border-amber-500/20',
  build: 'bg-purple-500/10 border-purple-500/20',
  success: 'bg-green-500/10 border-green-500/20',
  error: 'bg-red-500/10 border-red-500/20',
  info: 'bg-secondary/50 border-border/50',
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AgentTimeline({ events, visible, onClose }: AgentTimelineProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-border overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 h-8 bg-card/50">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Agent Timeline</span>
              <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1 rounded">{events.length} events</span>
            </div>
            {onClose && (
              <button onClick={onClose} className="h-5 w-5 rounded flex items-center justify-center hover:bg-secondary transition-colors">
                <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="max-h-[180px] overflow-y-auto px-3 py-2 space-y-1">
            {events.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No events yet. AI actions will appear here.</p>
            )}
            {events.map((event) => {
              const Icon = eventIcons[event.type];
              return (
                <div
                  key={event.id}
                  className={`flex items-start gap-2 p-1.5 rounded-md border ${eventBgColors[event.type]} transition-colors`}
                >
                  <Icon className={`h-3 w-3 mt-0.5 shrink-0 ${eventColors[event.type]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-foreground truncate">{event.label}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(event.timestamp)}</span>
                    </div>
                    {event.detail && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{event.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
