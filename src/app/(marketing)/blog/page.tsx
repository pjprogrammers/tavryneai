import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://tavryneai.vercel.app';

export const metadata: Metadata = {
  title: 'Blog | Tavryne AI — Vibe Coding Tips & AI Development Guides',
  description:
    'Learn about AI vibe coding, Tavryne AI tips and tutorials, browser-based AI development best practices, and generative coding techniques.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Blog | Tavryne AI',
    description: 'AI vibe coding guides, tips, and tutorials for the Tavryne AI platform.',
    url: `${SITE_URL}/blog`,
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
