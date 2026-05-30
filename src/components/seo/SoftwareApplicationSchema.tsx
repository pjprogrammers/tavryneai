import { JsonLd } from './JsonLd';

const SITE_URL = 'https://tavryneai.vercel.app';

export function SoftwareApplicationSchema() {
  return (
    <JsonLd
      id="software-application-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#softwareapplication`,
        name: 'Tavryne AI',
        alternateName: ['TavryneAI', 'Tavryne Vibe Code', 'Tavryne Coding AI', 'Tavryne AI IDE'],
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web browser',
        browserRequirements: 'Modern browser with JavaScript enabled',
        description:
          'Tavryne AI is a browser-based AI-powered development environment that generates production-ready code through natural conversation. Built with Next.js, it supports multi-provider AI routing through NVIDIA NIM, OpenCode Zen, and OpenRouter.',
        url: SITE_URL,
        image: `${SITE_URL}/preview.png`,
        softwareVersion: '1.0.0',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free tier with 10,000 tokens per day',
          availability: 'https://schema.org/InStock',
        },
        author: {
          '@type': 'Organization',
          name: 'Tavryne AI',
          url: SITE_URL,
        },
        featureList: [
          'Natural language code generation',
          'Multi-provider AI routing (NVIDIA NIM, OpenCode Zen, OpenRouter)',
          'In-browser live preview via esbuild-wasm',
          'Monaco code editor with syntax highlighting',
          'Real-time streaming code generation',
          'Iterative refinement through conversation',
          'Automatic checkpoint and rewind',
          'One-click Vercel deployment',
          'Session sharing with shareable links',
          'Voice input support',
          'Screenshot/image-based input',
          'Multi-agent parallel execution',
        ],
        screenshot: `${SITE_URL}/preview.png`,
      }}
    />
  );
}
