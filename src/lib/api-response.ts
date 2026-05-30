import { NextResponse } from 'next/server';

export function json<T>(data: T, init?: { status?: number; headers?: Record<string, string> }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: {
      'Cache-Control': 'no-store, private',
      ...init?.headers,
    },
  });
}
