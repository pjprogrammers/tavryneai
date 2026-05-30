'use client';
import { AVAILABLE_MODELS, DEFAULT_MODEL, AIProvider } from '@/lib/types/ai';
import { PROVIDER_LABELS as providerLabels } from '@/lib/utils/constants';
import { useProjectStore } from '@/lib/store/useProjectStore';

const providerColors: Record<AIProvider, string> = {
  nvidia: 'bg-green-500',
  opencode: 'bg-emerald-500',
  openrouter: 'bg-blue-500',
};

const PROVIDER_ORDER: AIProvider[] = ['nvidia', 'opencode', 'openrouter'];

function groupModelsByProvider() {
  const groups: Record<AIProvider, typeof AVAILABLE_MODELS> = {
    nvidia: [],
    opencode: [],
    openrouter: [],
  };
  for (const m of AVAILABLE_MODELS) {
    groups[m.provider].push(m);
  }
  return PROVIDER_ORDER.filter((p) => groups[p].length > 0).map((p) => ({
    provider: p,
    label: providerLabels[p],
    models: groups[p],
  }));
}

export function ModelSelector() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const updateProject = useProjectStore((s) => s.updateProject);

  const handleChange = async (modelId: string) => {
    const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
    if (model && currentProject) {
      await updateProject(currentProject.id, {
        selectedModel: model.id,
      });
    }
  };

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === currentProject?.selectedModel);
  const grouped = groupModelsByProvider();

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentProject?.selectedModel || DEFAULT_MODEL}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-dark-bg text-foreground text-xs rounded px-2 py-1.5 border border-dark-border focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
      >
        {grouped.map((group) => (
          <optgroup key={group.provider} label={group.label}>
            {group.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.displayName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {currentModel && (
        <span
          className={`inline-block w-2 h-2 rounded-full ${providerColors[currentModel.provider]}`}
          title={providerLabels[currentModel.provider]}
        />
      )}
    </div>
  );
}
