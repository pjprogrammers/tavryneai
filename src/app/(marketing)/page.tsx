import type { Metadata } from 'next';
import LandingClient from './LandingClient';

const SITE_URL = 'https://tavryneai.vercel.app';

export const metadata: Metadata = {
  title: 'Tavryne AI – AI Website & App Builder',
  description:
    'Build production-ready websites, web apps, and SaaS products with AI through natural conversation. No coding required.',
  keywords: [
    'Tavryne AI',
    'Tavryne',
    'TavryneAI',
    'Tavryne Vibe Code',
    'Tavryne AI IDE',
    'Tavryne Coding AI',
    'Tavryne AI Platform',
    'tavryne create websites',
    'tavryne website builder',
    'vibe coding platform',
    'AI coding assistant',
    'AI development environment',
    'build websites using AI',
    'build with AI',
    'AI website builder',
    'create websites with AI',
    'AI website generator',
    'AI website creator',
    'website building AI',
    'build website with AI',
    'browser-based AI IDE',
    'natural language programming',
    'AI SaaS builder',
    'conversational coding',
    'AI code generation',
    'Next.js app builder',
    'no-code AI platform',
  ],
  openGraph: {
    title: 'Tavryne AI – AI Website & App Builder',
    description:
      'Build production-ready websites, web apps, and SaaS products with AI through natural conversation. No coding required.',
    url: SITE_URL,
    siteName: 'Tavryne AI',
    images: [
      {
        url: `${SITE_URL}/ogimage.png`,
        width: 1024,
        height: 541,
        alt: 'Tavryne AI - AI website and app builder, no coding required',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tavryne AI – AI Website & App Builder',
    description:
      'Build production-ready websites, web apps, and SaaS products with AI through natural conversation. No coding required.',
    images: [`${SITE_URL}/ogimage.png`],
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
