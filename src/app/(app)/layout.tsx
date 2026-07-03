import type { Metadata, Viewport } from 'next';
import { AppShell } from './_app-shell';
import { getAdminPath } from '@/lib/admin';

const SITE_URL = 'https://tavryneai.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Tavryne AI',
  },
  description: 'Your Tavryne AI dashboard. Access your AI-built projects, track token usage, and continue building production-ready websites, web apps, and SaaS products with AI.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#11111b',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const adminPath = getAdminPath();
  return <AppShell adminPath={adminPath}>{children}</AppShell>;
}
