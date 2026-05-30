import { JsonLd } from './JsonLd';

interface FaqItem {
  question: string;
  answer: string;
}

const SITE_URL = 'https://tavryneai.vercel.app';

export function FaqSchema({ questions }: { questions: FaqItem[] }) {
  return (
    <JsonLd
      id="faq-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: questions.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      }}
    />
  );
}
