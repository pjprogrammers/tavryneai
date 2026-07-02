export const DAILY_TOKEN_LIMIT = 10000;
export const DEFAULT_FRAMEWORK = 'nextjs' as const;
export const APP_NAME = 'TavryneAI';
export const APP_URL = 'https://tavryneai.vercel.app';

export const PROVIDER_LABELS: Record<string, string> = {
  nvidia: 'NVIDIA NIM',
  opencode: 'OpenCode Zen',
  openrouter: 'OpenRouter',
};

export const PROVIDER_COLORS: Record<string, string> = {
  nvidia: '#76B900',
  opencode: '#10B981',
  openrouter: '#3B82F6',
};

export const FALLBACK_TIMEOUT_MS = 5000;
export const MODEL_TIMEOUT_MS = 300000;
export const FALLBACK_NOTIFICATION_SECONDS = 5;
export const MAX_CONSECUTIVE_FAILURES = 3;

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhrxbpqsa';
export const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'tavryneai-uploads';
export const CLOUDINARY_BASE_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  css: 'css',
  json: 'json',
  md: 'markdown',
  html: 'html',
};
