import type { Metadata } from 'next';
import SharedSessionClient from './SharedSessionClient';

const SITE_URL = 'https://tavryneai.vercel.app';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;

  return {
    title: `Shared Session — ${code}`,
    description: 'View a shared AI-built project created with Tavryne AI. See how websites, web apps, and SaaS products are built through natural conversation — no coding required.',
    alternates: { canonical: `${SITE_URL}/share/${code}` },
    openGraph: {
      title: `Shared Session — ${code} | Tavryne AI`,
      description: 'View a shared AI-built project created with Tavryne AI. See how websites, web apps, and SaaS products are built through natural conversation — no coding required.',
      url: `${SITE_URL}/share/${code}`,
      type: 'article',
      siteName: 'Tavryne AI',
      locale: 'en_US',
      images: [
        {
          url: `${SITE_URL}/ogimage.png`,
          width: 1024,
          height: 541,
          alt: 'Shared Tavryne AI Session',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@tavryneai',
      creator: '@tavryneai',
      title: `Shared Session — ${code} | Tavryne AI`,
      description: 'View a shared AI-built project created with Tavryne AI. See how websites, web apps, and SaaS products are built through natural conversation — no coding required.',
      images: [`${SITE_URL}/ogimage.png`],
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
