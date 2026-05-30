import { MODEL_DISABLE_MINUTES, MAX_CONSECUTIVE_FAILURES } from './fallback-chain';

export interface ModelHealthEntry {
  modelId: string;
  successCount: number;
  failureCount: number;
  lastFailure: number;
  disabledUntil: number;
}

class ModelHealthTracker {
  private models: Map<string, ModelHealthEntry> = new Map();

  get(modelId: string): ModelHealthEntry {
    let entry = this.models.get(modelId);
    if (!entry) {
      entry = { modelId, successCount: 0, failureCount: 0, lastFailure: 0, disabledUntil: 0 };
      this.models.set(modelId, entry);
    }
    return entry;
  }

  recordSuccess(modelId: string): void {
    const entry = this.get(modelId);
    entry.successCount++;
    entry.failureCount = 0;
  }

  recordFailure(modelId: string): void {
    const entry = this.get(modelId);
    entry.failureCount++;
    entry.lastFailure = Date.now();
    if (entry.failureCount >= MAX_CONSECUTIVE_FAILURES) {
      entry.disabledUntil = Date.now() + MODEL_DISABLE_MINUTES * 60 * 1000;
      entry.failureCount = 0;
    }
  }

  isAvailable(modelId: string): boolean {
    const entry = this.models.get(modelId);
    if (!entry) return true;
    if (entry.disabledUntil > Date.now()) return false;
    return true;
  }

  getAvailableModels<T extends { id: string }>(models: T[]): T[] {
    return models.filter((m) => this.isAvailable(m.id));
  }

  getDisabledModels(): { modelId: string; remainingMinutes: number }[] {
    const now = Date.now();
    const disabled: { modelId: string; remainingMinutes: number }[] = [];
    for (const [, entry] of this.models) {
      if (entry.disabledUntil > now) {
        disabled.push({
          modelId: entry.modelId,
          remainingMinutes: Math.ceil((entry.disabledUntil - now) / 60000),
        });
      }
    }
    return disabled;
  }

  reset(): void {
    this.models.clear();
  }
}

export const modelHealth = new ModelHealthTracker();
