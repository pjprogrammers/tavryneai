'use client';
import { useEffect, useState } from 'react';

const subscribers = new Set<(now: number) => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

function ensureTicker() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    const now = Date.now();
    subscribers.forEach((cb) => cb(now));
  }, 30000);
}

function teardownTicker() {
  if (intervalId && subscriberCount === 0) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function useTick(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (intervalMs !== 30000) {
      const id = setInterval(() => setNow(Date.now()), intervalMs);
      return () => clearInterval(id);
    }
    ensureTicker();
    subscriberCount += 1;
    subscribers.add(setNow);
    return () => {
      subscribers.delete(setNow);
      subscriberCount -= 1;
      teardownTicker();
    };
  }, [intervalMs]);

  return now;
}
