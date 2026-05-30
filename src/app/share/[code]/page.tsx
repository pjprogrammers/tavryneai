import type { Metadata } from 'next';
import SharedSessionClient from './SharedSessionClient';

const SITE_URL = 'https://tavryneai.vercel.app';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;

  return {
    title: `Shared Session — ${code} | Tavryne AI`,
    description:
      'View a shared Tavryne AI coding session. See how AI-generated code was created through natural conversation in the Tavryne AI vibe coding platform.',
    alternates: { canonical: `${SITE_URL}/share/${code}` },
    openGraph: {
      title: `Shared Tavryne AI Session — ${code}`,
      description: 'Explore an AI-generated project built with Tavryne AI. See the conversation and code that created it.',
      url: `${SITE_URL}/share/${code}`,
      type: 'article',
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SharedSessionPage({ params }: Props) {
  const { code } = await params;
  return <SharedSessionClient code={code} />;
}
