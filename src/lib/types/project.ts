import type { AgentEventPayload } from '@/lib/types/ai';

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'deleted';
  framework: 'nextjs' | 'react' | 'vanilla' | 'vue' | 'python';
  selectedModel: string;
  tokenCount: number;
  deployUrl: string | null;
  githubRepo: string | null;
  isPublic: boolean;
  thumbnail: string | null;
  expiresAt?: Date;
  customInstructions?: string;
  projectMemory?: string;
  templateId?: string;
  shareCode?: string;
  previewDeployments?: { url: string; platform: string; createdAt: Date }[];
}

export interface ProjectMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokensUsed: number;
  modelUsed: string;
  provider: 'nvidia' | 'opencode' | 'openrouter';
  files: FileSnapshot[] | null;
  agentEvents?: AgentEventPayload[];
}

export interface FileSnapshot {
  path: string;
  content: string;
}

export interface ProjectCreatePayload {
  title: string;
  description: string;
  framework: Project['framework'];
}
