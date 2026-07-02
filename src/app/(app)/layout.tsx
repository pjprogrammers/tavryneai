import type { Metadata, Viewport } from 'next';
import { AppShell } from './_app-shell';
import { getAdminPath } from '@/lib/admin';

const SITE_URL = 'https://tavryneai.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s',
  },
  description:
    'Tavryne AI dashboard. Access your projects, manage your account, track token usage, and continue building with the AI vibe coding platform.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: `${SITE_URL}/dashboard`,
  },
  openGraph: {
    title: 'Dashboard | Tavryne AI',
    description: 'Access your projects, manage your account, and continue building with Tavryne AI.',
    url: `${SITE_URL}/dashboard`,
    type: 'website',
    siteName: 'Tavryne AI',
    images: [
      {
        url: `${SITE_URL}/ogimage.png`,
        secureUrl: `${SITE_URL}/ogimage.png`,
        width: 1024,
        height: 541,
        alt: 'Tavryne AI Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tavryneai',
    creator: '@tavryneai',
    title: 'Dashboard | Tavryne AI',
    description: 'Access your projects and continue building with Tavryne AI.',
    images: [`${SITE_URL}/ogimage.png`],
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
