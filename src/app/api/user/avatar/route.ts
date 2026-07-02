import { NextResponse } from 'next/server';
import { verifyAuth, isErrorResponse, requireEmailVerified } from '@/lib/firebase/auth';
import { checkRateLimit } from '@/lib/server-rate-limit';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 30_000;
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/avif': [0x00, 0x00, 0x00],
};

function detectMimeFromBuffer(buf: Buffer): string | null {
  for (const [mime, bytes] of Object.entries(MAGIC_BYTES)) {
    if (bytes.length > buf.length) continue;
    const ok = bytes.every((b, i) => buf[i] === b);
    if (ok) return mime;
  }
  return null;
}

export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if (isErrorResponse(auth)) return auth;
  const emailGuard = requireEmailVerified(auth);
  if (emailGuard) return emailGuard;

  const rl = checkRateLimit(`avatar:${auth.uid}`, { maxTokens: 5, refillRate: 1, refillIntervalMs: 12000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many uploads. Please wait.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart payload' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: 'Empty file' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image exceeds 10MB limit' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  const detectedMime = detectMimeFromBuffer(buf);
  if (!detectedMime || !ALLOWED_CONTENT_TYPES.includes(detectedMime)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
  }

  try {
    const outgoing = new FormData();
    const blob = new Blob([buf], { type: detectedMime });
    outgoing.append('file', blob, file.name || 'avatar');
    outgoing.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    outgoing.append('folder', `avatars/${auth.uid}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: outgoing,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      console.error('[avatar] Cloudinary upload failed');
      return NextResponse.json({ error: 'Upload failed' }, { status: 502 });
    }

    return NextResponse.json({ success: true, imageUrl: data.secure_url });
  } catch (err) {
    console.error('[avatar] Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
