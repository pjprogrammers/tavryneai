import { JsonLd } from './JsonLd';

const SITE_URL = 'https://tavryneai.vercel.app';

export function WebsiteSchema() {
  return (
    <JsonLd
      id="website-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'Tavryne AI',
        alternateName: ['TavryneAI', 'Tavryne', 'Tavryne Vibe Code', 'AI website builder', 'build websites using AI'],
        url: SITE_URL,
        description:
          'Turn any idea into a working app through conversation. Tavryne AI is the AI vibe coding platform for everyone.',
        inLanguage: 'en-US',
        copyrightYear: 2026,
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SITE_URL}/projects?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        ],
      }}
    />
  );
}
