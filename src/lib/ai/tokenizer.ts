const MODEL_TOKENS_PER_CHAR: Record<string, number> = {
  'gpt-4': 0.25,
  'gpt-3.5': 0.25,
};

const DEFAULT_TOKENS_PER_CHAR = 0.25;

export function countTokens(text: string, model: string = 'gpt-4'): number {
  if (!text) return 0;
  const ratio = MODEL_TOKENS_PER_CHAR[model] || DEFAULT_TOKENS_PER_CHAR;
  return Math.ceil(text.length * ratio);
}

export function countMessagesTokens(
  messages: Array<{ role: string; content: string }>,
  model: string = 'gpt-4'
): number {
  let total = 0;
  for (const msg of messages) {
    total += countTokens(msg.content, model) + 4;
  }
  return total;
}

export function estimateTokensFromPrompt(prompt: string): number {
  return countTokens(prompt) + 10;
}
