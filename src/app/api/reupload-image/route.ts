import { NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import { z } from 'zod';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/lib/utils/constants';

const reuploadSchema = z.object({
  imageUrl: z.string().url().max(2000),
});

export const dynamic = 'force-dynamic';

/* =========================================================
   SSRF PROTECTION
========================================================= */

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 30_000;

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

// Blocked hostnames (hostname-only, canonicalized)
function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower === '127.0.0.1' || lower === '0.0.0.0' || lower === '[::1]') return true;
  if (lower.startsWith('10.') || lower.startsWith('192.168.') || lower.startsWith('169.254.')) return true;
  if (lower.startsWith('172.') && (parseInt(lower.split('.')[1] || '0', 10) >= 16 && parseInt(lower.split('.')[1] || '0', 10) <= 31)) return true;
  if (lower.startsWith('[fc00:') || lower.startsWith('[fe80:')) return true;
  return false;
}

export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  // Rate limit: 5 requests per 60s per user
  const rl = checkRateLimit(`reupload:${auth.uid}`, { maxTokens: 5, refillRate: 1, refillIntervalMs: 12000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
    });
  }

  try {
    let body: z.infer<typeof reuploadSchema>;
    try {
      body = reuploadSchema.parse(await request.json());
    } catch {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    const { imageUrl } = body;

    // SECURITY: Parse and canonicalize URL once — use canonicalized form everywhere
    let parsed: URL;
    try {
      parsed = new URL(imageUrl.trim());
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (parsed.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only HTTPS URLs are allowed' }, { status: 400 });
    }

    // SECURITY: Block private/internal hostnames before DNS resolution
    if (isBlockedHost(parsed.hostname)) {
      return NextResponse.json({ error: 'Invalid or blocked image URL' }, { status: 400 });
    }

    // SECURITY: DNS rebinding protection — resolve hostname and verify it doesn't point to a private IP
    try {
      const addresses = await dns.resolve4(parsed.hostname);
      for (const ip of addresses) {
        if (isBlockedHost(ip)) {
          return NextResponse.json({ error: 'Invalid or blocked image URL' }, { status: 400 });
        }
      }
    } catch {
      // DNS resolution failure — still proceed; let Cloudinary validate reachability
    }

    // Block SVG (XSS vector) and GIF by extension
    const pathLower = parsed.pathname.toLowerCase();
    if (pathLower.endsWith('.svg') || pathLower.endsWith('.gif')) {
      return NextResponse.json({ error: 'SVG and GIF files are not supported' }, { status: 400 });
    }

    const canonicalUrl = parsed.toString();

    // HEAD request with redirects disabled — REQUIRED. If we cannot validate
    // the upstream image ourselves, we fail closed (reject the upload) rather
    // than silently forwarding untrusted bytes to Cloudinary.
    let headRes: Response;
    try {
      const headController = new AbortController();
      const headTimeout = setTimeout(() => headController.abort(), 10_000);
      headRes = await fetch(canonicalUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: headController.signal,
      });
      clearTimeout(headTimeout);
    } catch (err) {
      console.warn('[reupload-image] HEAD pre-check failed:', err);
      return NextResponse.json({ error: 'Could not validate image URL' }, { status: 400 });
    }

    // SECURITY: If the server responds with a redirect, reject (prevents open redirect abuse)
    if (headRes.status >= 300 && headRes.status < 400) {
      return NextResponse.json({ error: 'Redirects are not supported' }, { status: 400 });
    }

    if (!headRes.ok) {
      return NextResponse.json({ error: 'Image URL returned an error' }, { status: 400 });
    }

    const contentType = headRes.headers.get('content-type') || '';
    const contentLength = parseInt(headRes.headers.get('content-length') || '0', 10);

    const isAllowedMime = ALLOWED_CONTENT_TYPES.some((t) => contentType.startsWith(t));
    if (!isAllowedMime) {
      return NextResponse.json({ error: 'URL does not point to a supported image type' }, { status: 400 });
    }

    if (contentLength > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Image exceeds 10MB limit' }, { status: 400 });
    }

    // Rehost through Cloudinary
    const formData = new FormData();
    formData.append('file', canonicalUrl);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'avatars/url-uploads');

    const uploadController = new AbortController();
    const uploadTimeout = setTimeout(() => uploadController.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
      signal: uploadController.signal,
    });
    clearTimeout(uploadTimeout);

    const data = await res.json();

    if (!res.ok) {
      console.error('[ReuploadImage] Cloudinary upload failed');
      return NextResponse.json({ error: 'Failed to rehost image' }, { status: 500 });
    }

    return NextResponse.json({ success: true, imageUrl: data.secure_url });
  } catch (err: any) {
    console.error('[ReuploadImage] Error:', err);
    return NextResponse.json({ error: 'Failed to process image URL' }, { status: 500 });
  }
}
