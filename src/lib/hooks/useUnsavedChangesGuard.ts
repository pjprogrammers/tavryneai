'use client';
import { useEffect } from 'react';

export function useUnsavedChangesGuard(isDirty: boolean, message = 'You have unsaved changes. Are you sure you want to leave?') {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, message]);
}
