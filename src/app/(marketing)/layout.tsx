import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import { SoftwareApplicationSchema } from '@/components/seo/SoftwareApplicationSchema';
import { WebsiteSchema } from '@/components/seo/WebsiteSchema';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

const SITE_URL = 'https://tavryneai.vercel.app';

const faqQuestions = [
  {
    question: 'What is Tavryne AI?',
    answer:
      'Tavryne AI is a browser-based AI coding platform that generates production-ready web applications through natural conversation. Simply describe what you want to build, and Tavryne AI creates the code using multi-provider AI routing through NVIDIA NIM, OpenCode Zen, and OpenRouter.',
  },
  {
    question: 'Is Tavryne AI free to use?',
    answer:
      'Yes! Tavryne AI offers a free tier with 10,000 tokens per day, 5 active projects, and access to all AI providers. No credit card required.',
  },
  {
    question: 'What AI models does Tavryne AI use?',
    answer:
      'Tavryne AI routes your prompts through a fallback chain of NVIDIA NIM, OpenCode Zen, and OpenRouter, ensuring the best available model handles your request.',
  },
  {
    question: 'Can I deploy apps built with Tavryne AI?',
    answer:
      'Yes, you can export your project or deploy directly to Vercel with one click. Tavryne AI generates production-ready code that you can host anywhere.',
  },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <WebsiteSchema />
      <FaqSchema questions={faqQuestions} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_URL },
          { name: 'Features', url: `${SITE_URL}/#features` },
          { name: 'Pricing', url: `${SITE_URL}/#pricing` },
          { name: 'About', url: `${SITE_URL}/about` },
          { name: 'Privacy Policy', url: `${SITE_URL}/privacy` },
          { name: 'Terms of Service', url: `${SITE_URL}/terms` },
        ]}
      />
      {children}
    </>
  );
}
