import { sanitizeError } from '@/lib/utils/sanitize';

export async function opencodeGenerate(
  params: { messages: Array<{ role: string; content: string }>; model: string; systemPrompt?: string; signal?: AbortSignal },
  onToken: (token: string) => void
): Promise<void> {
  const response = await fetch('https://api.opencode.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENCODE_ZEN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.systemPrompt
        ? [{ role: 'system', content: params.systemPrompt }, ...params.messages]
        : params.messages,
      stream: true,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OpenCode Zen (${params.model}): HTTP ${response.status}${body ? ' — ' + sanitizeError(body.slice(0, 200)) : ''}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const token = parsed.choices?.[0]?.delta?.content || '';
        if (token) onToken(token);
      } catch {
        // skip malformed chunks
      }
    }
  }
}
