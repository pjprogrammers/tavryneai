'use client';
import { useEffect, useRef, useCallback, useState } from 'react';

type ChunkErrorEvent = ErrorEvent & { error: { name: string; message: string } };

const CHUNK_ERROR_PATTERNS = [
  'ChunkLoadError',
  'Loading chunk',
  'Loading CSS chunk',
  'dynamically imported module',
  'import()',
];

export function ChunkErrorHandler({ children }: { children: React.ReactNode }) {
  const [hasRecoverableError, setHasRecoverableError] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const handleRecovery = useCallback(() => {
    retryCountRef.current += 1;
    if (retryCountRef.current >= maxRetries) {
      window.location.reload();
      return;
    }
    setHasRecoverableError(false);
  }, []);

  useEffect(() => {
    const handler = (event: ChunkErrorEvent) => {
      const error = event.error ?? event;
      const message = error?.message ?? '';
      const name = error?.name ?? '';

      const isChunkError = CHUNK_ERROR_PATTERNS.some(
        (p) => message.includes(p) || name.includes(p)
      );

      if (!isChunkError) return;

      event.preventDefault();
      event.stopPropagation();

      setHasRecoverableError(true);
    };

    window.addEventListener('error', handler as EventListener);
    window.addEventListener('unhandledrejection', handler as EventListener);

    return () => {
      window.removeEventListener('error', handler as EventListener);
      window.removeEventListener('unhandledrejection', handler as EventListener);
    };
  }, []);

  if (hasRecoverableError) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="text-center max-w-md p-8">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Loading issue detected</h2>
          <p className="text-sm text-muted-foreground mb-6">
            A module failed to load. This can happen after a deployment update.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRecovery}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
