export type AIProvider = 'nvidia' | 'opencode' | 'openrouter';

export interface AIModel {
  id: string;
  provider: AIProvider;
  displayName: string;
  contextWindow: number;
  speed: 'slow' | 'fast' | 'fastest';
  bestFor: string;
}

export interface GenerateRequest {
  projectId: string;
  messages: Array<{ role: string; content: string }>;
  model: string;
  provider: AIProvider;
  framework: string;
  systemPrompt?: string;
}

export type AgentStepStatus = 'pending' | 'running' | 'completed';

export interface AgentStep {
  status: AgentStepStatus;
  title: string;
}

export interface AgentThinkingEvent {
  steps: AgentStep[];
}

export interface AgentToolEvent {
  tool: 'read_file' | 'write_file' | 'edit_file' | 'create_file' | 'delete_file' | 'search' | 'run_command';
  file?: string;
  description?: string;
}

export interface AgentDiffEvent {
  file: string;
  oldContent?: string;
  newContent?: string;
  action: 'create' | 'modify' | 'delete';
}

export interface AgentTerminalEvent {
  command: string;
  output: string;
  exitCode?: number;
}

export interface AgentVerificationItem {
  name: string;
  passed: boolean;
  output?: string;
}

export interface AgentSummaryEvent {
  message: string;
  filesModified: { path: string; action: string }[];
  changes: string[];
  verification: AgentVerificationItem[];
}

export type AgentEventType = 'thinking' | 'tool' | 'diff' | 'terminal' | 'summary';

export type AgentEventPayload =
  | { type: 'thinking'; data: AgentThinkingEvent }
  | { type: 'tool'; data: AgentToolEvent }
  | { type: 'diff'; data: AgentDiffEvent }
  | { type: 'terminal'; data: AgentTerminalEvent }
  | { type: 'summary'; data: AgentSummaryEvent };

export interface StreamEvent {
  token?: string;
  status?: string;
  fallback?: boolean;
  from?: string;
  to?: string;
  error?: string;
  done?: boolean;
  provider_error?: boolean;
  provider?: string;
  tokensUsed?: number;
  messageId?: string;
  agent?: AgentEventPayload;
}

export interface AIFileChange {
  path: string;
  action: 'create' | 'modify' | 'delete';
  content: string;
  description?: string;
}

export interface AIResponse {
  summary?: string;
  changes?: AIFileChange[];
  files: AIFileChange[];
}

const HARDCODED_MODELS: AIModel[] = [
  { id: 'nvidia/nemotron-3-super-free', provider: 'nvidia', displayName: 'Nemotron 3 Super Free', contextWindow: 128000, speed: 'slow', bestFor: 'Complex code generation' },
  { id: 'opencode/deepseek-v4-flash-free', provider: 'opencode', displayName: 'DeepSeek V4 Flash Free', contextWindow: 128000, speed: 'fast', bestFor: 'Fast code generation' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', provider: 'openrouter', displayName: 'Nemotron 3 Super 120B', contextWindow: 128000, speed: 'slow', bestFor: 'Complex reasoning' },
  { id: 'poolside/laguna-m.1:free', provider: 'openrouter', displayName: 'Laguna M.1', contextWindow: 128000, speed: 'fast', bestFor: 'General coding' },
  { id: 'openai/gpt-oss-120b:free', provider: 'openrouter', displayName: 'GPT-OSS 120B', contextWindow: 128000, speed: 'slow', bestFor: 'Complex tasks' },
  { id: 'z-ai/glm-4.5-air:free', provider: 'openrouter', displayName: 'GLM 4.5 Air', contextWindow: 128000, speed: 'fast', bestFor: 'Lightweight tasks' },
  { id: 'arcee-ai/trinity-large-thinking:free', provider: 'openrouter', displayName: 'Trinity Large Thinking', contextWindow: 128000, speed: 'slow', bestFor: 'Reasoning' },
  { id: 'poolside/laguna-xs.2:free', provider: 'openrouter', displayName: 'Laguna XS.2', contextWindow: 128000, speed: 'fastest', bestFor: 'Quick completions' },
  { id: 'deepseek/deepseek-v4-flash:free', provider: 'openrouter', displayName: 'DeepSeek V4 Flash Free', contextWindow: 128000, speed: 'fast', bestFor: 'Fast code generation' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', provider: 'openrouter', displayName: 'Nemotron 3 Nano 30B', contextWindow: 128000, speed: 'fast', bestFor: 'Efficient coding' },
  { id: 'openai/gpt-oss-20b:free', provider: 'openrouter', displayName: 'GPT-OSS 20B', contextWindow: 128000, speed: 'fastest', bestFor: 'Simple tasks' },
  { id: 'baidu/cobuddy:free', provider: 'openrouter', displayName: 'CoBuddy', contextWindow: 128000, speed: 'fast', bestFor: 'Assisted coding' },
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', provider: 'openrouter', displayName: 'Nemotron 3 Nano Omni Reasoning', contextWindow: 128000, speed: 'slow', bestFor: 'Reasoning tasks' },
  { id: 'minimax/minimax-m2.5:free', provider: 'openrouter', displayName: 'MiniMax M2.5', contextWindow: 128000, speed: 'fast', bestFor: 'General purpose' },
  { id: 'google/gemma-4-31b-it:free', provider: 'openrouter', displayName: 'Gemma 4 31B', contextWindow: 128000, speed: 'fast', bestFor: 'General coding' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', provider: 'openrouter', displayName: 'Nemotron Nano 9B v2', contextWindow: 128000, speed: 'fastest', bestFor: 'Quick coding' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', provider: 'openrouter', displayName: 'Nemotron Nano 12B v2 VL', contextWindow: 128000, speed: 'fast', bestFor: 'Vision-language' },
  { id: 'google/gemma-4-26b-a4b-it:free', provider: 'openrouter', displayName: 'Gemma 4 26B', contextWindow: 128000, speed: 'fast', bestFor: 'Efficient generation' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', provider: 'openrouter', displayName: 'Qwen3 Next 80B', contextWindow: 128000, speed: 'slow', bestFor: 'Complex generation' },
  { id: 'qwen/qwen3-coder:free', provider: 'openrouter', displayName: 'Qwen3 Coder', contextWindow: 128000, speed: 'fast', bestFor: 'Code generation' },
  { id: 'openrouter/free', provider: 'openrouter', displayName: 'OpenRouter Free (Auto)', contextWindow: 128000, speed: 'fast', bestFor: 'Auto-select best free model' },
];

function parseModelsFromEnv(): AIModel[] | null {
  const envConfigs: Array<{ envVar: string; provider: AIProvider }> = [
    { envVar: 'NEXT_PUBLIC_NVIDIA_MODELS', provider: 'nvidia' },
    { envVar: 'NEXT_PUBLIC_OPENCODE_ZEN_MODELS', provider: 'opencode' },
    { envVar: 'NEXT_PUBLIC_OPENROUTER_MODELS', provider: 'openrouter' },
  ];

  let hasAny = false;
  const result: AIModel[] = [];

  for (const { envVar, provider } of envConfigs) {
    const val = process.env[envVar] || '';
    if (!val.trim()) continue;
    hasAny = true;
    const modelIds = val.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
    for (const id of modelIds) {
      const lastPart = id.split('/').pop() || id;
      const displayName = lastPart
        .replace(/[:.\-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      result.push({
        id,
        provider,
        displayName,
        contextWindow: 128000,
        speed: 'fast',
        bestFor: 'Custom model',
      });
    }
  }

  return hasAny ? result : null;
}

function buildAvailableModels(): AIModel[] {
  const fromEnv = parseModelsFromEnv();
  return fromEnv ?? HARDCODED_MODELS;
}

export const AVAILABLE_MODELS: AIModel[] = buildAvailableModels();
export const DEFAULT_MODEL: string = AVAILABLE_MODELS[0]?.id || 'nvidia/nemotron-3-super-free';
