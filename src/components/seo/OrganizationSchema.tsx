import { JsonLd } from './JsonLd';

const SITE_URL = 'https://tavryneai.vercel.app';

export function OrganizationSchema() {
  return (
    <JsonLd
      id="organization-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Tavryne AI',
        alternateName: ['TavryneAI', 'Tavryne', 'Tavryne AI Platform', 'Tavryne Vibe Code'],
        url: SITE_URL,
        description:
          'Tavryne AI is a browser-based AI coding platform that turns ideas into working apps through natural conversation. Powered by NVIDIA NIM, OpenCode Zen, and OpenRouter.',
        logo: `${SITE_URL}/favicon.png`,
        sameAs: [
          'https://github.com/tavryneai',
          'https://twitter.com/tavryneai',
        ],
        foundingDate: '2025',
        knowsAbout: [
          'AI coding assistant',
          'vibe coding platform',
          'browser-based IDE',
          'generative AI development',
          'natural language programming',
        ],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free tier with 10,000 tokens daily',
        },
      }}
    />
  );
}
