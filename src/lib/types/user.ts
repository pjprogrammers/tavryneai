export type AuthProvider = 'email' | 'google.com' | 'github.com';
export type PlanType = 'free' | 'pro' | 'team';

export interface UserPreferences {
  theme?: 'light' | 'dark';
  colorTheme?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  provider: AuthProvider;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  verificationEmailSentAt?: Date;
  lastIpAddress?: string;
  lastUserAgent?: string;
  signUpIp?: string;
  createdAt: Date;
  lastLoginAt: Date;
  tokensUsedToday: number;
  tokenResetDate: string;
  totalTokensConsumed: number;
  dailyUsage?: Record<string, number>;
  planType: PlanType;
  projectCount: number;
  isActive?: boolean;
  isAdmin?: boolean;
  preferences?: UserPreferences;
}

export interface TokenUsage {
  tokensUsedToday: number;
  dailyLimit: number;
  remaining: number;
  resetTime: string;
}
