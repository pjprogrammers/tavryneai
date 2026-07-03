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
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://cdn.jsdelivr.net https://unpkg.com https://esm.sh https://checkout.razorpay.com",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com",
  "img-src 'self' data: blob: https: http://localhost:* https://res.cloudinary.com https://firebasestorage.googleapis.com https://*.googleusercontent.com https://avatars.githubusercontent.com https://avatars0.githubusercontent.com https://avatars1.githubusercontent.com https://avatars2.githubusercontent.com https://avatars3.githubusercontent.com https://*.twimg.com https://abs.twimg.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "media-src 'self' data: blob: https://res.cloudinary.com https://firebasestorage.googleapis.com",
  "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com https://api.github.com https://api.cloudinary.com https://res.cloudinary.com https://accounts.google.com https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com https://esm.sh https://integrate.api.nvidia.com https://api.opencode.ai https://openrouter.ai https://*.opencode.ai https://*.vercel.app",
  "frame-src 'self' blob: https://accounts.google.com https://accounts.youtube.com https://*.firebaseapp.com https://*.firebaseio.com https://github.com https://*.githubusercontent.com https://vercel.com https://*.vercel.com https://checkout.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com https://github.com",
  "frame-ancestors 'none'",
].join('; ');

const SUSPICIOUS_PATTERNS = ['sqlmap', 'nikto', 'nmap', 'masscan', 'bot', 'crawler', 'scraper'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Fix Turbopack serving CSS/JS with wrong MIME type
  if (pathname.startsWith('/_next/static')) {
    if (pathname.endsWith('.css')) {
      response.headers.set('Content-Type', 'text/css');
    } else if (pathname.endsWith('.js')) {
      response.headers.set('Content-Type', 'application/javascript');
    } else {
      return response;
    }
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

  // Block the canonical /admin route when an obfuscated path is configured.
  // Only /{ADMIN_PATH} is allowed in that case. The default route /admin still
  // works when ADMIN_PATH is unset or set to 'admin'.
  const adminPath = (process.env.ADMIN_PATH || 'admin').replace(/^\/+|\/+$/g, '');
  if (adminPath !== 'admin' && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)).*)',
    '/_next/static/:path*.css',
    '/_next/static/:path*.js',
  ],
};
