import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';

const SITE_URL = 'https://tavryneai.vercel.app';

export const metadata: Metadata = {
  title: 'About Us | Tavryne AI',
  description:
    'Learn about Tavryne AI — the browser-based AI vibe coding platform that turns ideas into production-ready apps through natural conversation. Discover our mission, technology, and team.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About Tavryne AI — Browser-Based AI Vibe Coding Platform',
    description:
      'Discover how Tavryne AI is redefining software development with multi-provider AI routing, browser-based IDE, and natural language programming. Learn about our mission, technology, and vision.',
    url: `${SITE_URL}/about`,
    type: 'website',
    siteName: 'Tavryne AI',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/ogimage.png`,
        width: 1024,
        height: 541,
        alt: 'About Tavryne AI — AI Vibe Coding Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tavryneai',
    creator: '@tavryneai',
    title: 'About Tavryne AI — Browser-Based AI Vibe Coding Platform',
    description:
      'Discover how Tavryne AI is redefining software development with multi-provider AI routing, browser-based IDE, and natural language programming.',
    images: [`${SITE_URL}/ogimage.png`],
  },
  keywords: [
    'about Tavryne AI',
    'AI coding platform team',
    'browser-based AI IDE',
    'vibe coding company',
    'AI development platform',
    'generative AI coding startup',
    'multi-provider AI routing',
    'NVIDIA NIM AI coding',
    'conversational programming platform',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        id="aboutpage-schema"
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': `${SITE_URL}/about/#aboutpage`,
          name: 'About Tavryne AI',
          description:
            'Tavryne AI is a browser-based AI vibe coding platform that turns ideas into working apps through natural conversation.',
          url: `${SITE_URL}/about`,
          mainEntity: {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
          },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
            ],
          },
        }}
      />
      <JsonLd
        id="faq-schema-about"
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is Tavryne AI?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Tavryne AI is a browser-based AI vibe coding platform that generates production-ready web applications through natural conversation. Simply describe what you want to build, and Tavryne AI creates the code using multi-provider AI routing through NVIDIA NIM, OpenCode Zen, and OpenRouter.',
              },
            },
            {
              '@type': 'Question',
              name: 'How does Tavryne AI work?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'You describe your application in natural language, and Tavryne AI routes your request through an intelligent fallback chain of leading AI providers. The generated code is displayed in a Monaco editor, previewed live in an esbuild-powered sandbox, and can be exported or deployed with one click.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is Tavryne AI free?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, Tavryne AI offers a generous free tier with 10,000 tokens per day, 5 active projects, and full access to all AI providers. No credit card is required to get started.',
              },
            },
          ],
        }}
      />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Link
            href="/"
            className="text-sm text-primary hover:text-primary/80 transition-colors mb-8 inline-flex items-center gap-1"
          >
            <span aria-hidden="true">&larr;</span> Back to Tavryne AI
          </Link>

          {/* Hero */}
          <section className="mb-16">
            <h1 className="text-display-lg font-heading font-bold text-foreground mb-6 leading-tight">
              We Believe Building Software{' '}
              <span className="gradient-text">Should Be Effortless</span>
            </h1>
            <p className="text-body-lg text-muted-foreground max-w-3xl leading-relaxed">
              Tavryne AI is a browser-based AI vibe coding platform that lets anyone — from seasoned
              developers to complete beginners — turn ideas into production-ready applications simply
              by describing them in natural language. We are on a mission to democratize software
              creation and eliminate the gap between imagination and implementation.
            </p>
          </section>

          {/* Our Story */}
          <section className="mb-16">
            <h2 className="text-headline-xl font-heading font-semibold text-foreground mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-body-md text-muted-foreground leading-relaxed">
              <p>
                Tavryne AI was founded in 2025 with a bold vision: make software development as
                natural as having a conversation. Traditional development requires mastering complex
                frameworks, toolchains, and deployment pipelines. We saw an opportunity to leverage
                the rapid advances in large language models to create a platform where the computer
                does the heavy lifting while humans focus on creativity and intent.
              </p>
              <p>
                What started as an experimental prototype — a simple chat interface wired to an AI
                model that could generate React components — quickly evolved into a full-fledged
                platform. Today, Tavryne AI routes user prompts through an intelligent fallback chain
                of three world-class AI providers: <strong>NVIDIA NIM</strong>,{' '}
                <strong>OpenCode Zen</strong>, and <strong>OpenRouter</strong>. This multi-provider
                architecture ensures maximum uptime, optimal response quality, and automatic failover
                if any provider experiences issues.
              </p>
              <p>
                Since our public beta launch, thousands of users have built real applications on
                Tavryne AI — from personal portfolio sites and landing pages to full SaaS dashboards,
                API backends, and internal tools. Our community spans 50+ countries and includes
                indie developers, startup founders, educators, and enterprise teams.
              </p>
            </div>
          </section>

          {/* Our Technology */}
          <section className="mb-16">
            <h2 className="text-headline-xl font-heading font-semibold text-foreground mb-6">
              Our Technology
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Multi-Provider AI Routing',
                  body: 'Every prompt is intelligently routed through NVIDIA NIM, OpenCode Zen, and OpenRouter with automatic failover. If one provider is degraded, your request is seamlessly redirected to the next, ensuring uninterrupted development flow.',
                },
                {
                  title: 'In-Browser Preview Engine',
                  body: 'Generated code is bundled in real-time using esbuild-wasm and rendered in an isolated iframe sandbox. You see your application come to life instantly without any server round-trips or build pipelines.',
                },
                {
                  title: 'Monaco Editor Integration',
                  body: 'Full-featured code editor with syntax highlighting, IntelliSense, multi-cursor editing, and diff views. Every AI generation creates a checkpoint so you can rewind, compare, and restore any version of your project.',
                },
                {
                  title: 'Enterprise-Grade Security',
                  body: 'Your code and data are encrypted in transit (TLS 1.3) and at rest (AES-256). Authentication is handled through Firebase with support for email/password, Google, and GitHub OAuth. We maintain SOC 2-aligned practices.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-secondary/20 border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
                >
                  <h3 className="text-headline-md font-heading text-foreground mb-3">{item.title}</h3>
                  <p className="text-body-md text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-16">
            <h2 className="text-headline-xl font-heading font-semibold text-foreground mb-6">
              Our Values
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: 'Democratize Creation',
                  body: 'We believe the ability to create software should not be limited by years of training or access to expensive tools. Everyone with an idea should be able to bring it to life.',
                },
                {
                  title: 'Quality Over Speed',
                  body: 'While AI accelerates development, we never compromise on code quality. Our multi-provider routing selects the best model for each task, and generated code follows industry best practices.',
                },
                {
                  title: 'Privacy First',
                  body: 'Your code belongs to you. We do not train on your prompts or generated content. Our infrastructure is designed with privacy and data sovereignty at its core.',
                },
                {
                  title: 'Continuous Innovation',
                  body: 'The AI landscape evolves daily. We continuously integrate the latest models, techniques, and best practices so our users always have access to cutting-edge technology.',
                },
              ].map((value, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-headline-md font-heading text-foreground mb-2">{value.title}</h3>
                    <p className="text-body-md text-muted-foreground leading-relaxed">{value.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-16">
            <h2 className="text-headline-xl font-heading font-semibold text-foreground mb-6">
              Why Developers Choose Tavryne AI
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { stat: '10,000+', label: 'Daily Free Tokens' },
                { stat: '3', label: 'AI Providers (Auto-Failover)' },
                { stat: '50+', label: 'Countries Reached' },
                { stat: '99.9%', label: 'Platform Uptime' },
                { stat: 'Real-Time', label: 'Live Preview' },
                { stat: '1-Click', label: 'Vercel Deploy' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-gradient-to-br from-primary/5 to-transparent border border-border rounded-xl p-5 text-center"
                >
                  <div className="text-headline-lg font-heading font-bold gradient-text mb-1">{item.stat}</div>
                  <div className="text-body-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <h2 className="text-headline-xl font-heading font-semibold text-foreground mb-6">
              How It Works
            </h2>
            <div className="space-y-8">
              {[
                {
                  step: '01',
                  title: 'Describe Your Idea',
                  body: 'Type or speak what you want to build in plain English. For example: "Create a landing page for a SaaS product with pricing tiers, testimonials, and a contact form."',
                },
                {
                  step: '02',
                  title: 'AI Generates Your Code',
                  body: 'Your prompt is routed through NVIDIA NIM, OpenCode Zen, and OpenRouter with intelligent fallback. The AI generates production-ready code using modern frameworks like React, Next.js, and Tailwind CSS.',
                },
                {
                  step: '03',
                  title: 'Preview & Iterate',
                  body: 'See your app come to life instantly in the live preview pane. Use the built-in Monaco editor to make manual tweaks, or continue the conversation to refine the output.',
                },
                {
                  step: '04',
                  title: 'Deploy & Share',
                  body: 'Export your code or deploy directly to Vercel with one click. Generate shareable links to collaborate with your team or showcase your work to clients.',
                },
              ].map((step) => (
                <div key={step.step} className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-heading font-bold">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-headline-md font-heading text-foreground mb-2">{step.title}</h3>
                    <p className="text-body-md text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-16">
            <h2 className="text-headline-xl font-heading font-semibold text-foreground mb-6">
              Who Uses Tavryne AI
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  audience: 'Indie Developers & Solopreneurs',
                  use: 'Quickly prototype MVPs, build landing pages, and validate business ideas without hiring a full engineering team. Launch faster and iterate cheaper.',
                },
                {
                  audience: 'Startup Teams',
                  use: 'Accelerate feature development, generate boilerplate code, and maintain consistent architecture across projects. Free your engineers to focus on business logic.',
                },
                {
                  audience: 'Educators & Students',
                  use: 'Learn modern web development by example. See how AI translates natural language into real code. Perfect for teaching React, Next.js, and Tailwind CSS concepts.',
                },
                {
                  audience: 'Enterprise Teams',
                  use: 'Rapidly prototype internal tools, dashboards, and admin panels. Generate consistent, maintainable code that follows your organization\'s best practices.',
                },
              ].map((item) => (
                <div
                  key={item.audience}
                  className="bg-secondary/20 border border-border rounded-xl p-6"
                >
                  <h3 className="text-headline-md font-heading text-foreground mb-3">{item.audience}</h3>
                  <p className="text-body-md text-muted-foreground leading-relaxed">{item.use}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Leadership */}
          <section className="mb-16">
            <h2 className="text-headline-xl font-heading font-semibold text-foreground mb-6">
              Leadership
            </h2>
            <p className="text-body-md text-muted-foreground leading-relaxed mb-6">
              Tavryne AI is built by a passionate team of engineers, AI researchers, and product
              designers who believe in the transformative power of generative AI. Our leadership
              brings decades of combined experience from cloud infrastructure, machine learning,
              and developer tools.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { role: 'Founder & CEO', area: 'Vision, Product Strategy' },
                { role: 'CTO', area: 'AI Architecture, Platform Engineering' },
                { role: 'Head of AI', area: 'Model Routing, Prompt Engineering' },
                { role: 'Head of Product', area: 'UX, Developer Experience' },
                { role: 'Head of Engineering', area: 'Infrastructure, Scale' },
                { role: 'Head of Security', area: 'Compliance, Data Protection' },
              ].map((person) => (
                <div
                  key={person.role}
                  className="bg-secondary/10 border border-border rounded-xl p-5 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center text-primary font-heading font-bold text-lg">
                    {person.role.charAt(0)}
                  </div>
                  <h3 className="text-label-md text-foreground mb-1">{person.role}</h3>
                  <p className="text-body-sm text-muted-foreground">{person.area}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Infrastructure & Security */}
          <section className="mb-16">
            <h2 className="text-headline-xl font-heading font-semibold text-foreground mb-6">
              Infrastructure & Security
            </h2>
            <div className="space-y-4 text-body-md text-muted-foreground leading-relaxed">
              <p>
                Tavryne AI runs on Google Cloud Platform and Vercel&apos;s global edge network.
                Authentication and data storage are handled by Firebase, providing enterprise-grade
                security with automatic encryption, access controls, and audit logging.
              </p>
              <p>
                All traffic is encrypted using TLS 1.3. User sessions are secured with Firebase
                Authentication supporting multi-factor authentication. API routes validate every
                request using Firebase JWT tokens with automatic expiry and refresh.
              </p>
              <p>
                We maintain strict access controls on our infrastructure. No Tavryne AI team member
                can access user code or prompts without explicit user consent and documented
                justification. Our code repositories are protected with branch protection rules,
                mandatory code review, and dependency scanning.
              </p>
              <p>
                We are working toward SOC 2 Type II certification and maintain data processing
                agreements (DPAs) with all our sub-processors, including Google Cloud, Vercel,
                NVIDIA, and OpenRouter.
              </p>
            </div>
          </section>

          {/* Roadmap */}
          <section className="mb-16">
            <h2 className="text-headline-xl font-heading font-semibold text-foreground mb-6">
              What&apos;s Next
            </h2>
            <div className="space-y-4 text-body-md text-muted-foreground leading-relaxed">
              <p>
                We are just getting started. Our roadmap includes real-time collaboration,
                custom model fine-tuning, enterprise SSO, expanded deployment targets (AWS, Cloudflare),
                CLI integration, and a plugin ecosystem. We are also exploring support for mobile
                development, Python backends, and database schema generation.
              </p>
              <p>
                Our commitment is to remain the most accessible, powerful, and privacy-respecting
                AI coding platform on the market. We will never train on your data, we will always
                offer a meaningful free tier, and we will continuously integrate the best AI models
                as they become available.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-headline-xl font-heading font-semibold text-foreground mb-6">
              Get in Touch
            </h2>
            <div className="bg-secondary/20 border border-border rounded-xl p-6">
              <p className="text-body-md text-muted-foreground leading-relaxed mb-4">
                We would love to hear from you. Whether you have a question about the platform,
                want to report a bug, discuss enterprise pricing, or explore partnership
                opportunities, the best way to reach us is through our GitHub repository.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/tavryneai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-label-md"
                >
                  <span aria-hidden="true">&#8599;</span> GitHub Repository
                </a>
                <a
                  href="https://twitter.com/tavryneai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-label-md"
                >
                  <span aria-hidden="true">&#8599;</span> Twitter / X
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
