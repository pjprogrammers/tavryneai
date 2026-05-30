import { JsonLd } from './JsonLd';

interface BreadcrumbItem {
  name: string;
  url: string;
}

const SITE_URL = 'https://tavryneai.vercel.app';

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      id="breadcrumb-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/#breadcrumb`,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
