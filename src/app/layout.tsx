import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/utils/theme';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/shared/toast';
import { ParticleContainer } from '@/components/particles/ParticleContainer';
import { ChunkErrorHandler } from '@/components/shared/ChunkErrorHandler';

const SITE_URL = 'https://tavryneai.vercel.app';
const SITE_NAME = 'Tavryne AI';
const SITE_DESCRIPTION = 'Build production-ready websites, web apps, and SaaS products with AI through natural conversation. No coding required.';
const OG_IMAGE = '/opengraph-image';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7C3AED' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1020' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Tavryne AI',
  title: {
    default: 'Tavryne AI – AI Website & App Builder',
    template: '%s | Tavryne AI',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Tavryne AI',
    'Tavryne',
    'TavryneAI',
    'Tavryne Vibe Code',
    'Tavryne AI IDE',
    'Tavryne Coding AI',
    'Tavryne AI Platform',
    'tavryne create websites',
    'tavryne website builder',
    'vibe coding platform',
    'AI coding assistant',
    'AI development environment',
    'build websites using AI',
    'build with AI',
    'AI website builder',
    'create websites with AI',
    'AI website generator',
    'AI website creator',
    'website building AI',
    'build website with AI',
    'browser-based AI IDE',
    'natural language programming',
    'AI code generation',
    'conversational coding',
    'AI SaaS builder',
    'Next.js app builder',
    'no-code AI platform',
    'generative AI development',
  ],
  authors: [
    { name: 'Tavryne AI', url: SITE_URL },
  ],
  creator: 'Tavryne AI',
  publisher: 'Tavryne AI',
  category: 'technology',
  classification: 'AI Development Platform',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
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
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-US': SITE_URL },
    media: { 'only screen and (max-width: 600px)': SITE_URL },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Tavryne AI – AI Website & App Builder',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        secureUrl: `${SITE_URL}${OG_IMAGE}`,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: 'Tavryne AI - AI website and app builder, no coding required',
        type: 'image/png',
      },
    ],
    countryName: 'United States',
    emails: ['support@tavryneai.com'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tavryneai',
    creator: '@tavryneai',
    title: 'Tavryne AI – AI Website & App Builder',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        alt: 'Tavryne AI - Build apps with AI',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: 'Tavryne AI',
    statusBarStyle: 'black-translucent',
  },
  appLinks: {
    web: {
      url: SITE_URL,
      should_fallback: true,
    },
  },
  verification: {
    google: 'yD0EuT3GHCroc_8sUd70Nt-puSwrlKEdsar7YRDcx_M',
  },
  other: {
    'og:email': 'support@tavryneai.com',
    'rating': 'General',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${mono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48x48.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#7C3AED" />
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
        <meta name="theme-color" content="#0B1020" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0B1020" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#7C3AED" />
        <meta name="color-scheme" content="dark light" />

        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://integrate.api.nvidia.com" />
        <link rel="dns-prefetch" href="https://api.opencode.ai" />
        <link rel="dns-prefetch" href="https://openrouter.ai" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('tavryne-theme');
                if (!theme) theme = 'dark';
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);

                var colorTheme = localStorage.getItem('tavryne-color-theme') || 'default';
                var colorMap = {
                  default: {'--primary':'262 83% 58%','--primary-foreground':'0 0% 100%','--ring':'262 83% 58%','--chart-1':'262 83% 58%','--accent-foreground':'262 83% 58%','--primary-fixed':'243 100% 94%','--primary-fixed-dim':'242 100% 88%','--on-primary-fixed':'244 100% 21%','--gradient-from':'262 83% 58%','--gradient-to':'239 84% 67%'},
                  forest: {'--primary':'142 76% 36%','--primary-foreground':'0 0% 100%','--ring':'142 76% 36%','--chart-1':'142 76% 36%','--accent-foreground':'142 76% 36%','--primary-fixed':'140 78% 94%','--primary-fixed-dim':'138 78% 88%','--on-primary-fixed':'142 100% 21%','--gradient-from':'142 76% 36%','--gradient-to':'160 84% 39%'},
                  ocean: {'--primary':'199 89% 48%','--primary-foreground':'0 0% 100%','--ring':'199 89% 48%','--chart-1':'199 89% 48%','--accent-foreground':'199 89% 48%','--primary-fixed':'200 90% 94%','--primary-fixed-dim':'198 88% 88%','--on-primary-fixed':'200 100% 21%','--gradient-from':'199 89% 48%','--gradient-to':'217 89% 61%'},
                  sunset: {'--primary':'346 83% 55%','--primary-foreground':'0 0% 100%','--ring':'346 83% 55%','--chart-1':'346 83% 55%','--accent-foreground':'346 83% 55%','--primary-fixed':'345 84% 94%','--primary-fixed-dim':'344 82% 88%','--on-primary-fixed':'346 100% 21%','--gradient-from':'346 83% 55%','--gradient-to':'15 90% 55%'},
                  monochrome: {'--primary':'0 0% 45%','--primary-foreground':'0 0% 100%','--ring':'0 0% 45%','--chart-1':'0 0% 45%','--accent-foreground':'0 0% 55%','--primary-fixed':'0 0% 94%','--primary-fixed-dim':'0 0% 88%','--on-primary-fixed':'0 0% 21%','--gradient-from':'0 0% 45%','--gradient-to':'0 0% 25%'},
                  midnight: {'--primary':'230 70% 50%','--primary-foreground':'0 0% 100%','--ring':'230 70% 50%','--chart-1':'230 70% 50%','--accent-foreground':'230 70% 50%','--primary-fixed':'228 72% 94%','--primary-fixed-dim':'226 70% 88%','--on-primary-fixed':'230 100% 21%','--gradient-from':'230 70% 50%','--gradient-to':'260 70% 50%'},
                  rose: {'--primary':'340 82% 52%','--primary-foreground':'0 0% 100%','--ring':'340 82% 52%','--chart-1':'340 82% 52%','--accent-foreground':'340 82% 52%','--primary-fixed':'340 80% 94%','--primary-fixed-dim':'338 78% 88%','--on-primary-fixed':'340 100% 21%','--gradient-from':'340 82% 52%','--gradient-to':'330 80% 60%'},
                  amber: {'--primary':'38 92% 50%','--primary-foreground':'0 0% 100%','--ring':'38 92% 50%','--chart-1':'38 92% 50%','--accent-foreground':'38 92% 50%','--primary-fixed':'40 90% 94%','--primary-fixed-dim':'38 88% 88%','--on-primary-fixed':'38 100% 21%','--gradient-from':'38 92% 50%','--gradient-to':'30 85% 55%'},
                  teal: {'--primary':'180 80% 35%','--primary-foreground':'0 0% 100%','--ring':'180 80% 35%','--chart-1':'180 80% 35%','--accent-foreground':'180 80% 35%','--primary-fixed':'182 82% 94%','--primary-fixed-dim':'180 80% 88%','--on-primary-fixed':'180 100% 21%','--gradient-from':'180 80% 35%','--gradient-to':'190 85% 40%'},
                  violet: {'--primary':'270 75% 55%','--primary-foreground':'0 0% 100%','--ring':'270 75% 55%','--chart-1':'270 75% 55%','--accent-foreground':'270 75% 55%','--primary-fixed':'268 76% 94%','--primary-fixed-dim':'266 74% 88%','--on-primary-fixed':'270 100% 21%','--gradient-from':'270 75% 55%','--gradient-to':'280 80% 60%'},
                  lime: {'--primary':'120 60% 40%','--primary-foreground':'0 0% 100%','--ring':'120 60% 40%','--chart-1':'120 60% 40%','--accent-foreground':'120 60% 40%','--primary-fixed':'118 62% 94%','--primary-fixed-dim':'116 60% 88%','--on-primary-fixed':'120 100% 21%','--gradient-from':'120 60% 40%','--gradient-to':'100 65% 45%'}
                };
                var colors = colorMap[colorTheme] || colorMap.default;
                var root = document.documentElement;
                for (var key in colors) {
                  if (colors.hasOwnProperty(key)) {
                    root.style.setProperty(key, colors[key]);
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ChunkErrorHandler>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </ChunkErrorHandler>
        <ParticleContainer />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
