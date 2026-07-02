import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Auth',
    template: '%s',
  },
  description:
    'Sign in to Tavryne AI, the browser-based AI vibe coding platform. Access your projects, continue building with AI, and manage your account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
