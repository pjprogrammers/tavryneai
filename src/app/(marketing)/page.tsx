import type { Metadata } from 'next';
import LandingClient from './LandingClient';

const SITE_URL = 'https://tavryneai.vercel.app';

export const metadata: Metadata = {
  title: 'Tavryne AI — Turn Ideas Into Apps with AI Vibe Coding',
  description:
    'Tavryne AI is the browser-based AI vibe coding platform that generates production-ready apps through natural conversation. Powered by NVIDIA NIM, OpenCode Zen, and OpenRouter. Start building free, no credit card needed.',
  keywords: [
    'Tavryne AI',
    'Tavryne',
    'TavryneAI',
    'Tavryne Vibe Code',
    'Tavryne AI IDE',
    'Tavryne Coding AI',
    'Tavryne AI Platform',
    'vibe coding platform',
    'AI coding assistant',
    'AI development environment',
    'browser-based AI IDE',
    'natural language programming',
    'AI SaaS builder',
    'conversational coding',
    'AI code generation',
    'Next.js app builder',
    'no-code AI platform',
  ],
  openGraph: {
    title: 'Tavryne AI — Turn Ideas Into Apps with AI Vibe Coding',
    description:
      'Describe what you want to build. Tavryne AI generates production-ready code through conversation. Free tier with 10,000 tokens daily.',
    url: SITE_URL,
    siteName: 'Tavryne AI',
    images: [
      {
        url: `${SITE_URL}/preview.png`,
        width: 1200,
        height: 630,
        alt: 'Tavryne AI — AI Vibe Coding Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tavryne AI — Turn Ideas Into Apps with AI Vibe Coding',
    description:
      'Describe what you want to build. Tavryne AI generates production-ready code through conversation. Free tier with 10,000 tokens daily.',
    images: [`${SITE_URL}/preview.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function LandingPage() {
  return <LandingClient />;
}
