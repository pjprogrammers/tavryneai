export interface UsageStats {
  tokensUsedToday: number;
  totalTokensConsumed: number;
  projectCount: number;
  aiGenerations: number;
  dailyLimit: number;
  dailyUsage: DailyUsage[];
  monthlyUsage: MonthlyUsage[];
  yearlyUsage: YearlyUsage[];
}

export interface DailyUsage {
  day: string;
  tokens: number;
}

export interface MonthlyUsage {
  month: string;
  tokens: number;
}

export interface YearlyUsage {
  year: string;
  tokens: number;
}

export interface ModelUsage {
  model: string;
  provider: string;
  tokens: number;
  pct: number;
}

export interface ActivityEntry {
  projectId: string;
  projectTitle: string;
  content: string;
  tokensUsed: number;
  timestamp: string;
  relativeTime: string;
}

export interface ProviderPerformance {
  provider: string;
  model: string;
  projectId: string;
  success: boolean;
  latencyMs: number;
  errorMessage?: string;
  timestamp: Date;
}

export interface GenerationError {
  projectId: string;
  userId: string;
  model: string;
  provider: string;
  errorMessage: string;
  previousAttempts: number;
  timestamp: Date;
}

export interface DiffFeedback {
  projectId: string;
  messageId: string;
  userId: string;
  filename: string;
  status: 'accepted' | 'rejected';
  timestamp: Date;
}

export interface DeploymentRecord {
  projectId: string;
  userId: string;
  type: 'export' | 'vercel';
  status: 'started' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface UserActivity {
  userId: string;
  action: string;
  projectId?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}
