'use client';
import { Separator } from 'react-resizable-panels';

export function ResizeHandle({ className = '' }: { className?: string }) {
  return (
    <Separator
      className={`group relative w-1.5 cursor-col-resize flex items-center justify-center transition-colors hover:bg-primary/10 data-[resize-handle-active]:bg-primary/20 shrink-0 ${className}`}
    >
      <div className="w-0.5 h-8 rounded-full bg-border group-hover:bg-primary/50 group-data-[resize-handle-active]:bg-primary/60 transition-colors" />
    </Separator>
  );
}
