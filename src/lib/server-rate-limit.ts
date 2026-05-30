const buckets = new Map<string, { tokens: number; lastRefill: number }>();

interface RateLimitConfig {
  maxTokens: number;
  refillRate: number;
  refillIntervalMs: number;
}

const DEFAULTS: RateLimitConfig = {
  maxTokens: 10,
  refillRate: 1,
  refillIntervalMs: 1000,
};

function refill(bucket: { tokens: number; lastRefill: number }, config: RateLimitConfig) {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(elapsed / config.refillIntervalMs) * config.refillRate;
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(bucket.tokens + tokensToAdd, config.maxTokens);
    bucket.lastRefill = now;
  }
}

export function checkRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const cfg = { ...DEFAULTS, ...config };
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: cfg.maxTokens, lastRefill: now };
    buckets.set(key, bucket);
  }

  refill(bucket, cfg);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: bucket.tokens, retryAfterMs: 0 };
  }

  const timeUntilNextToken = bucket.lastRefill + cfg.refillIntervalMs - now;
  return { allowed: false, remaining: 0, retryAfterMs: Math.max(timeUntilNextToken, 0) };
}

// Periodically clean stale entries to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const staleThreshold = Date.now() - 5 * 60 * 1000;
    for (const [key, bucket] of buckets) {
      if (bucket.lastRefill < staleThreshold) {
        buckets.delete(key);
      }
    }
  }, 60_000);
}
