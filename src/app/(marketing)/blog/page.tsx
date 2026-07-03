import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://tavryneai.vercel.app';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Guides, tutorials, and insights for building websites, web apps, and SaaS products with AI. Learn how Tavryne AI helps you build through natural conversation — no coding required.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Blog | Tavryne AI – AI Website & App Builder',
    description: 'Guides, tutorials, and insights for building websites, web apps, and SaaS products with AI through natural conversation. No coding required.',
    url: `${SITE_URL}/blog`,
    type: 'website',
    siteName: 'Tavryne AI',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Tavryne AI Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tavryneai',
    creator: '@tavryneai',
    title: 'Blog | Tavryne AI – AI Website & App Builder',
    description: 'Guides, tutorials, and insights for building websites, web apps, and SaaS products with AI through natural conversation. No coding required.',
    images: [`${SITE_URL}/opengraph-image`],
  },
  keywords: [
    'AI blog',
    'build apps with AI',
    'AI development guides',
    'Tavryne AI tutorials',
    'AI-powered development',
  ],
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

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <Link href="/" className="text-sm text-primary hover:text-primary/80 mb-8 inline-block">
          &larr; Back to Tavryne AI
        </Link>
        <h1 className="text-4xl font-bold text-foreground mb-4">Tavryne AI Blog</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Guides, tutorials, and insights about AI vibe coding with Tavryne AI.
        </p>

        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Coming soon. Stay tuned for Tavryne AI guides and tutorials.</p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Upcoming blog topics:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>What is Vibe Coding? A Complete Guide to AI-Powered Development</li>
            <li>Getting Started with Tavryne AI: Your First App in 5 Minutes</li>
            <li>How Tavryne AI Routes Prompts Across Multiple AI Providers</li>
            <li>Building Full-Stack Apps with Natural Language: A Tavryne AI Tutorial</li>
            <li>Comparing AI Code Generation Platforms: Tavryne AI vs. Alternatives</li>
            <li>From Idea to Deployment: The Complete Tavryne AI Workflow</li>
            <li>10 Tips for Better AI Code Generation with Tavryne AI</li>
            <li>How Browser-Based AI IDEs Are Changing Software Development</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
