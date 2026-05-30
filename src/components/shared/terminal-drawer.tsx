'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Log {
  type: 'info' | 'warn' | 'error' | 'success';
  message: string;
  timestamp: string;
  data?: string;
}

const sampleLogs: Log[] = [
  { type: 'info', message: 'Starting build process...', timestamp: '14:32:01' },
  { type: 'info', message: 'esbuild-wasm initialized', timestamp: '14:32:01' },
  { type: 'info', message: 'Bundling 12 files for preview...', timestamp: '14:32:02' },
  { type: 'success', message: 'Build successful (1.2s)', timestamp: '14:32:03' },
  { type: 'info', message: 'Preview updated: http://blob:1234', timestamp: '14:32:03' },
  { type: 'warn', message: 'Unresolved import: lodash. Using mock.', timestamp: '14:32:04' },
  { type: 'success', message: 'Preview ready', timestamp: '14:32:04' },
];

interface TerminalDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs?: Log[];
}

export function TerminalDrawer({ open, onOpenChange, logs = sampleLogs }: TerminalDrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, open]);

  const typeStyles: Record<string, string> = {
    info: 'text-blue-400',
    warn: 'text-amber-400',
    error: 'text-red-400',
    success: 'text-green-400',
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 200 }}
          exit={{ height: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-border bg-[#0a0a0f] overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#0a0a0f] border-b border-border/20">
            <div className="flex items-center gap-2">
              <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-white/70 font-mono">Terminal</span>
              <span className="text-[10px] text-white/30">Build output</span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-5 w-5 rounded flex items-center justify-center text-white/30 hover:text-white/70"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div ref={scrollRef} className="h-full overflow-y-auto p-3 font-mono text-xs leading-5 space-y-0.5">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-white/20 shrink-0 w-16">[{log.timestamp}]</span>
                <span className={typeStyles[log.type]}>{log.message}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-green-400">$</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a command..."
                className="flex-1 bg-transparent text-white/70 placeholder:text-white/20 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && input.trim()) {
                    setInput('');
                  }
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
