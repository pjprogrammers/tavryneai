'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface AuthShellProps {
  title: string;
  subtitle: string;
  error?: string | null;
  children: React.ReactNode;
  footer: React.ReactNode;
  heroTagline?: string;
  heroFeatures?: { icon: React.ReactNode; label: string }[];
}

export function AuthShell({ title, subtitle, error, children, footer, heroTagline, heroFeatures }: AuthShellProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-background relative overflow-x-hidden">
      {/* Decorative background — visible only on lg+ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-gradient-to-bl from-red-500/15 via-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-gradient-to-tr from-amber-500/10 via-yellow-500/5 to-transparent blur-3xl" />
      </div>

      {/* Subtle background for small screens (no big blobs) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(251,191,36,0.06), transparent 60%)',
        }}
      />

      <div className="relative min-h-[100dvh] flex flex-col lg:flex-row">
        {/* Hero panel — hidden below lg */}
        <HeroPanel tagline={heroTagline} features={heroFeatures} />

        {/* Form column */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full max-w-sm sm:max-w-md md:max-w-lg"
          >
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-xl p-5 sm:p-7 md:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6">
                  <Image src="/icon-32x32.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
                  <span className="text-base sm:text-lg font-semibold text-foreground">TavryneAI</span>
                </Link>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground px-2">
                  {subtitle}
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-4 p-2.5 sm:p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm animate-fade-in"
                >
                  {error}
                </div>
              )}

              {children}

              <div className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
                {footer}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function HeroPanel({
  tagline,
  features,
}: {
  tagline?: string;
  features?: { icon: React.ReactNode; label: string }[];
}) {
  return (
    <div className="hidden lg:flex lg:w-[44%] xl:w-[40%] 2xl:w-[36%] relative flex-col justify-between p-10 xl:p-14 2xl:p-20 border-r border-border bg-gradient-to-br from-card/40 via-background to-background">
      <Link href="/" className="inline-flex items-center gap-2.5">
        <Image src="/icon-48x48.png" alt="" width={48} height={48} className="h-10 w-10 rounded-xl shadow-lg" />
        <span className="text-xl font-semibold text-foreground">TavryneAI</span>
      </Link>

      <div className="max-w-md space-y-6">
        <h2
          className="text-3xl xl:text-4xl 2xl:text-5xl font-bold tracking-tight leading-tight"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {tagline ?? 'Build apps with AI, not boilerplate.'}
        </h2>
        <p className="text-sm xl:text-base text-muted-foreground leading-relaxed">
          TavryneAI turns your ideas into working applications. Prompt, preview, deploy — all from a single browser tab.
        </p>

        {features && features.length > 0 && (
          <ul className="space-y-3 pt-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  {f.icon}
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Already used by makers shipping full apps in a weekend.
      </p>
    </div>
  );
}
