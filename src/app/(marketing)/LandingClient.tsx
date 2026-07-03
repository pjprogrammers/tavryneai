'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserMenu } from '@/components/ui/user-menu';
import { HeroParticles } from '@/components/particles/HeroParticles';
import { TiltCard } from '@/components/landing/TiltCard';
import { DecorativeShape } from '@/components/landing/GeometricSVG';
import { ThreeDShapes } from '@/components/landing/ThreeDShapes';
import { useAuthStore } from '@/lib/store/useAuthStore';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const features = [
  { title: 'Natural Language Prompts', description: 'Describe your website or app in plain English. TavryneAI generates production-ready code. Build websites using AI.', icon: 'chat' },
  { title: 'Multi-Provider AI', description: 'Routes through NVIDIA NIM, OpenCode Zen, and OpenRouter for best results.', icon: 'neurology' },
  { title: 'Live Code Preview', description: 'See your app come to life instantly with esbuild-wasm in-browser bundling.', icon: 'play_circle' },
  { title: 'Monaco Editor', description: 'Full-featured code editor with syntax highlighting, intellisense, and diff views.', icon: 'code' },
  { title: 'Iterative Refinement', description: 'Refine your app through conversation. Only changed files are updated.', icon: 'sync' },
  { title: 'Token Usage Tracking', description: 'Real-time token monitoring with daily limits and provider fallback.', icon: 'monitoring' },
];

const steps = [
  { number: '01', title: 'Describe Your Idea', description: 'Type what you want to build in natural language. Be as specific or as broad as you like.' },
  { number: '02', title: 'AI Generates Code', description: 'TavryneAI routes your prompt through the best available AI model, streaming results in real-time.' },
  { number: '03', title: 'Preview & Refine', description: 'See your app live in the preview panel. Make changes or iterate with follow-up prompts.' },
  { number: '04', title: 'Deploy & Share', description: 'Export your project or deploy directly to Vercel with one click.' },
];

const pricing = [
  { name: 'Free', price: '$0', description: 'For individuals exploring vibe coding', features: ['10,000 tokens/day', '5 active projects', 'All AI providers', 'Community support'], cta: 'Get Started', href: '/register', popular: false },
  { name: 'Pro', price: '$20', description: 'For professionals building production apps', features: ['100,000 tokens/day', 'Unlimited projects', 'Priority AI routing', 'Email support', 'GitHub export', 'Deploy to Vercel'], cta: 'Coming Soon', href: '#', popular: true },
  { name: 'Team', price: '$50', description: 'For teams collaborating on projects', features: ['500,000 tokens/day', 'Unlimited projects', 'Team workspaces', 'Collaborator roles', 'Priority support', 'Custom integrations'], cta: 'Coming Soon', href: '#', popular: false },
];

const faqItems = [
  {
    q: 'What is Tavryne AI?',
    a: 'Tavryne AI is a browser-based AI coding platform that generates production-ready web applications through natural conversation. Simply describe what you want to build, and Tavryne AI creates the code using multi-provider AI routing.',
  },
  {
    q: 'Is Tavryne AI free to use?',
    a: 'Yes! Tavryne AI offers a free tier with 10,000 tokens per day, 5 active projects, and access to all AI providers. No credit card required.',
  },
  {
    q: 'What AI models does Tavryne AI use?',
    a: 'Tavryne AI routes your prompts through a fallback chain of NVIDIA NIM, OpenCode Zen, and OpenRouter, ensuring the best available model handles your request.',
  },
  {
    q: 'Can I deploy apps built with Tavryne AI?',
    a: 'Yes, you can export your project or deploy directly to Vercel with one click. Tavryne AI generates production-ready code that you can host anywhere.',
  },
  {
    q: 'What kind of apps can I build with Tavryne AI?',
    a: 'You can build full-stack web applications including React, Next.js, and TypeScript projects. Tavryne AI handles routing, components, styling, and backend logic through conversation.',
  },
  {
    q: 'Can I build websites with AI using Tavryne?',
    a: 'Absolutely! Tavryne AI is the perfect AI website builder. Just describe the website you want — landing pages, SaaS apps, portfolios, e-commerce stores — and Tavryne creates them using AI. Build websites using AI with no coding required.',
  },
];

export default function LandingClient() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const isSignedIn = useAuthStore((s) => s.initialized && s.user !== null);
  const showHeroCta = !isSignedIn;

  return (
    <main className="relative min-h-screen bg-background">
      <ThreeDShapes />
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2" aria-label="Tavryne AI Home">
              <img src="/icon-32x32.png" alt="" className="h-8 w-8 rounded-lg" />
              <span className="text-lg font-semibold text-foreground">Tavryne AI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserMenu />
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="md:hidden h-9 w-9 rounded-lg border border-border flex items-center justify-center"
                aria-label={mobileMenu ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenu}
              >
                <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border/50 overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-3" aria-label="Mobile navigation">
                <Link href="#features" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenu(false)}>Features</Link>
                <Link href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenu(false)}>How it Works</Link>
                <Link href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenu(false)}>Pricing</Link>
                <Link href="#faq" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenu(false)}>FAQ</Link>
                <Link href="/login" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenu(false)}>Sign In</Link>
                <Link href="/register" className="block text-sm text-muted-foreground font-medium text-primary hover:text-primary/80" onClick={() => setMobileMenu(false)}>Get Started Free</Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden" aria-label="Hero">
        <HeroParticles />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Now in Public Beta
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
            >
              <span className="gradient-text">Turn any idea</span>
              <br />
              <span className="text-foreground">into a working website or app</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Describe the website or app you want to build. <strong>Tavryne AI</strong> generates production-ready code
              through conversation &mdash; build websites using AI powered by NVIDIA NIM, OpenCode Zen, and OpenRouter.
            </motion.p>

            {showHeroCta && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-xl shadow-xl shadow-primary/25">
                    Start Building Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            )}

            <motion.div
              variants={fadeUp}
              className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                10,000 tokens free daily
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Multi-provider AI
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative py-20 border-t border-border/50 overflow-hidden" aria-label="Features">
        <div className="absolute top-10 right-10 w-32 h-32 opacity-30 hidden lg:block">
          <DecorativeShape type="ring" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to build with Tavryne AI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build websites and apps using AI with Tavryne — a complete AI vibe coding platform for turning ideas into production applications through natural conversation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <TiltCard>
                  <article className="premium-card p-6 h-full cursor-default">
                    <span className="material-symbols-outlined text-2xl mb-3 block text-primary" aria-hidden="true">{feature.icon}</span>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </article>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative py-20 bg-secondary/30 border-t border-border/50 overflow-hidden" aria-label="How it works">
        <div className="absolute bottom-10 left-10 w-28 h-28 opacity-25 hidden lg:block">
          <DecorativeShape type="crystal" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How Tavryne AI works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From idea to working website or app in four simple steps using the Tavryne AI vibe coding platform. Create websites with AI in minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-primary">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative py-20 border-t border-border/50 overflow-hidden" aria-label="Pricing">
        <div className="absolute top-20 right-5 w-36 h-36 opacity-20 hidden lg:block">
          <DecorativeShape type="sphere" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start for free with Tavryne AI. Upgrade when you need more tokens and features.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <TiltCard>
                <article className={`relative premium-card p-6 flex flex-col ${
                  plan.popular ? 'border-primary ring-1 ring-primary' : ''
                }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={plan.name !== 'Free'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
                </article>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="relative py-20 border-t border-border/50" aria-label="Frequently Asked Questions">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently asked questions about Tavryne AI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about the Tavryne AI vibe coding platform.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <motion.details
                key={item.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="premium-card p-5 group cursor-pointer"
              >
                <summary className="flex items-center justify-between text-foreground font-medium">
                  <span>{item.q}</span>
                  <svg className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50 bg-secondary/30" aria-label="Call to action">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to build websites with AI using Tavryne AI?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers using <strong>Tavryne AI</strong> to turn their ideas into working websites and apps.
              No setup, no configuration. Just describe what you want and let AI build it. Build with AI, launch in minutes.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-xl shadow-xl shadow-primary/25">
                Start Building Free with Tavryne AI
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/50" aria-label="Site footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img src="/icon-32x32.png" alt="" className="h-7 w-7 rounded-lg" />
                <span className="text-sm font-semibold text-foreground">Tavryne AI</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Tavryne AI is the browser-based AI platform to build websites and apps through natural conversation. Create websites with AI and turn ideas into production-ready apps. Powered by NVIDIA NIM, OpenCode Zen, and OpenRouter.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="text-xs text-muted-foreground hover:text-foreground transition-colors">How it Works</Link></li>
                <li><Link href="#pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/blog" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Powered by NVIDIA NIM &middot; OpenCode Zen &middot; OpenRouter
            </p>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Tavryne AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
