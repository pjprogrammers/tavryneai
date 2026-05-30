import { AVAILABLE_MODELS, AIModel } from '@/lib/types/ai';

export const MODEL_TIMEOUT_MS = 300000;

export const FALLBACK_NOTIFICATION_SECONDS = 5;

export const MAX_CONSECUTIVE_FAILURES = 3;

export const MODEL_DISABLE_MINUTES = 30;

export function getNextFallbackModel(
  currentModelId: string,
  availableModels?: AIModel[]
): AIModel | null {
  const models = availableModels || AVAILABLE_MODELS;
  const currentIndex = models.findIndex((m) => m.id === currentModelId);
  if (currentIndex < 0 || currentIndex >= models.length - 1) return null;
  return models[currentIndex + 1];
}

export function getFallbackModelChain(
  startModelId: string,
  availableModels?: AIModel[]
): AIModel[] {
  const models = availableModels || AVAILABLE_MODELS;
  const startIdx = models.findIndex((m) => m.id === startModelId);
  if (startIdx < 0) return models;
  return models.slice(startIdx);
}
