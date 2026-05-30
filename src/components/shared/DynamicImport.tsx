'use client';
import { ComponentType, createElement, useCallback, useEffect, useRef, useState } from 'react';

interface DynamicImportProps {
  load: () => Promise<{ default: ComponentType<any> }>;
  loading?: React.ReactNode;
  error?: React.ReactNode | ((retry: () => void) => React.ReactNode);
  props?: Record<string, unknown>;
}

export function DynamicImport({ load, loading, error, props }: DynamicImportProps) {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const mountedRef = useRef(true);

  const doLoad = useCallback(async () => {
    setHasError(false);
    setIsRetrying(retryCountRef.current > 0);
    try {
      const mod = await load();
      if (mountedRef.current) {
        setComponent(() => mod.default);
        setHasError(false);
      }
    } catch {
      if (!mountedRef.current) return;
      retryCountRef.current += 1;
      if (retryCountRef.current < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * retryCountRef.current));
        if (mountedRef.current) doLoad();
      } else {
        setHasError(true);
      }
    } finally {
      if (mountedRef.current) setIsRetrying(false);
    }
  }, [load]);

  useEffect(() => {
    mountedRef.current = true;
    doLoad();
    return () => { mountedRef.current = false; };
  }, [doLoad]);

  if (hasError) {
    if (typeof error === 'function') {
      return <>{error(doLoad)}</>;
    }
    return <>{error ?? null}</>;
  }

  if (isRetrying) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground">Retrying...</p>
        </div>
      </div>
    );
  }

  if (!Component) {
    return <>{loading ?? null}</>;
  }

  return createElement(Component, props);
}
