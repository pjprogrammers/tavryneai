export type FailureType =
  | 'timeout'
  | 'rate_limit'
  | 'provider_down'
  | 'quota_exceeded'
  | 'network_error'
  | 'empty_response';

const FAILURE_PATTERNS: [RegExp, FailureType][] = [
  [/timeout/i, 'timeout'],
  [/timed ?out/i, 'timeout'],
  [/stall/i, 'timeout'],
  [/429/i, 'rate_limit'],
  [/rate.?limit/i, 'rate_limit'],
  [/too many requests/i, 'rate_limit'],
  [/provider busy/i, 'rate_limit'],
  [/quota/i, 'quota_exceeded'],
  [/credit/i, 'quota_exceeded'],
  [/usage limit/i, 'quota_exceeded'],
  [/free.*limit/i, 'quota_exceeded'],
  [/daily.*limit/i, 'quota_exceeded'],
  [/503/i, 'provider_down'],
  [/502/i, 'provider_down'],
  [/504/i, 'provider_down'],
  [/unavailable/i, 'provider_down'],
  [/service.*temporarily/i, 'provider_down'],
  [/provider.*fail/i, 'provider_down'],
  [/network/i, 'network_error'],
  [/connection.*reset/i, 'network_error'],
  [/econnrefused/i, 'network_error'],
  [/econnreset/i, 'network_error'],
  [/enotfound/i, 'network_error'],
  [/fetch.*fail/i, 'network_error'],
  [/request.*fail/i, 'network_error'],
  [/abort/i, 'timeout'],
  [/empty.*response/i, 'empty_response'],
  [/no.*content/i, 'empty_response'],
  [/choices.*empty/i, 'empty_response'],
];

export function classifyFailure(error: unknown): FailureType {
  const text = String(error);
  for (const [pattern, type] of FAILURE_PATTERNS) {
    if (pattern.test(text)) return type;
  }
  return 'provider_down';
}

export function getFailureMessage(type: FailureType, modelLabel?: string): string {
  const name = modelLabel || 'Current model';
  switch (type) {
    case 'timeout':
      return `${name} timed out. No response received within 5 minutes.`;
    case 'rate_limit':
      return `${name} is rate-limited. Too many requests.`;
    case 'provider_down':
      return `${name} provider is unavailable.`;
    case 'quota_exceeded':
      return `${name} quota exhausted. Free tier limit reached.`;
    case 'network_error':
      return `Network error connecting to ${name}.`;
    case 'empty_response':
      return `${name} returned an empty response.`;
  }
}
