const API_KEY_PATTERN = /(["'`]?)(?:api[_-]?key|apikey|secret|token|password|private[_-]?key|authorization|bearer)\1?\s*[:=]\s*["'`]?[A-Za-z0-9_\-]{16,}/gi;

const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9_\-.]{10,}/gi;

const URL_SECRET_PATTERN = /\/\/[^:]+:[^@]+@/g;

export function sanitizeError(message: string): string {
  return message
    .replace(API_KEY_PATTERN, '$1***REDACTED***')
    .replace(BEARER_PATTERN, 'Bearer ***REDACTED***')
    .replace(URL_SECRET_PATTERN, '//***REDACTED***:***REDACTED***@');
}
