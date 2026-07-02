'use client';
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function Dialog({ open, onOpenChange, children, ariaLabel, ariaLabelledBy }: DialogProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element inside the dialog on open.
    const id = window.setTimeout(() => {
      const root = containerRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const target = focusable[0];
      if (target) target.focus();
    }, 0);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        return;
      }
      if (e.key !== 'Tab' || !containerRef.current) return;
      // Simple focus trap: keep tabbing inside the dialog.
      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);

    return () => {
      window.clearTimeout(id);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      // Restore focus to the element that opened the dialog.
      previousFocusRef.current?.focus?.();
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className="relative z-50 w-full max-w-lg mx-4 animate-slide-up"
      >
        {children}
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl shadow-xl premium-shadow-lg p-6', className)}>
      {children}
    </div>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };
