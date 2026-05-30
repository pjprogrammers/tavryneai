import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APP_URL = 'https://tavryneai.vercel.app';

const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.github.com https://api.cloudinary.com https://res.cloudinary.com https://accounts.google.com https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com https://esm.sh",
  "frame-src 'self' https://accounts.google.com https://accounts.youtube.com https://*.firebaseapp.com https://github.com https://*.githubusercontent.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const SUSPICIOUS_PATTERNS = ['sqlmap', 'nikto', 'nmap', 'masscan', 'bot', 'crawler', 'scraper'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Fix Turbopack serving CSS with wrong MIME type
  if (pathname.startsWith('/_next/static') && pathname.endsWith('.css')) {
    response.headers.set('Content-Type', 'text/css');
    return response;
  }

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response.headers.set('Content-Security-Policy', CSP_DIRECTIVES);

  // Authenticated API routes — prevent caching of sensitive data
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/generate')) {
    response.headers.set('Cache-Control', 'no-store, private');
  }

  // Log suspicious requests
  if (!pathname.startsWith('/_next') && !pathname.startsWith('/favicon') && !pathname.includes('.')) {
    const userAgent = request.headers.get('user-agent') || '';
    if (SUSPICIOUS_PATTERNS.some((p) => userAgent.toLowerCase().includes(p))) {
      console.warn(`[Security] Suspicious UA: ${userAgent}`);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|js|woff|woff2|ttf)).*)',
    '/_next/static/:path*.css',
  ],
};
