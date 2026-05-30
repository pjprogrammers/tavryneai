import { nvidiaGenerate } from './providers/nvidia';
import { opencodeGenerate } from './providers/opencode';
import { openrouterGenerate } from './providers/openrouter';
import { PROVIDER_LABELS } from '@/lib/utils/constants';
import { sanitizeError } from '@/lib/utils/sanitize';

export type Provider = 'nvidia' | 'opencode' | 'openrouter';

interface GenerateParams {
  messages: Array<{ role: string; content: string }>;
  model: string;
  systemPrompt?: string;
  signal?: AbortSignal;
  onToken: (token: string) => void;
}

const PROVIDER_ORDER: Provider[] = ['nvidia', 'opencode', 'openrouter'];

const providerMap: Record<Provider, typeof nvidiaGenerate> = {
  nvidia: nvidiaGenerate,
  opencode: opencodeGenerate,
  openrouter: openrouterGenerate,
};

export interface FallbackEvent {
  from: Provider;
  to: Provider;
  error?: string;
}

export function createProviderTimeoutSignal(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error(`Provider timeout after ${timeoutMs}ms`)), timeoutMs);
  return {
    signal: ctrl.signal,
    clear: () => clearTimeout(timer),
  };
}

export async function generateWithFallback(
  params: GenerateParams,
  startProvider: Provider = 'nvidia',
  onFallback?: (event: FallbackEvent) => void
): Promise<{ provider: Provider }> {
  const maxAttempts = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const startIndex = PROVIDER_ORDER.indexOf(startProvider);

    for (let i = startIndex; i < PROVIDER_ORDER.length; i++) {
      const provider = PROVIDER_ORDER[i];
      const timeoutCtrl = createProviderTimeoutSignal(120000);
      try {
        const generator = providerMap[provider];
        await generator({ ...params, signal: timeoutCtrl.signal }, params.onToken);
        timeoutCtrl.clear();
        return { provider };
      } catch (err) {
        timeoutCtrl.clear();
        lastError = err as Error;
        const label = PROVIDER_LABELS[provider];
        const errMsg = lastError.message;
        if (i < PROVIDER_ORDER.length - 1) {
          const nextProvider = PROVIDER_ORDER[i + 1];
          onFallback?.({ from: provider, to: nextProvider, error: `${label}: ${sanitizeError(errMsg)}` });
          continue;
        }
        break;
      }
    }
  }

  const label = PROVIDER_LABELS[startProvider];
  throw lastError || new Error(`${label}: All providers failed after 3 attempts`);
}
