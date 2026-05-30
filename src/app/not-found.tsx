import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Page Not Found | Tavryne AI',
  description: 'The page you are looking for does not exist. Return to the Tavryne AI homepage to start building with AI.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <span className="text-8xl font-bold gradient-text block mb-4">404</span>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-base text-muted-foreground mb-8 max-w-sm mx-auto">
          This page doesn&apos;t exist or has been moved. Let&apos;s get you back to building with <strong>Tavryne AI</strong>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Tavryne AI
        </Link>
      </div>
    </div>
  );
}
