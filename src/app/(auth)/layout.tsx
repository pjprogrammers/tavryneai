import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: '%s | Tavryne AI',
  },
  description: 'Sign in to Tavryne AI to access your AI-built projects and continue building production-ready websites, web apps, and SaaS products through natural conversation. No coding required.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
