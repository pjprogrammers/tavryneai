import { MetadataRoute } from 'next';

const SITE_URL = 'https://tavryneai.vercel.app';

const PRIVATE_PATHS = [
  '/api/',
  '/admin',
  '/dashboard',
  '/settings',
  '/projects',
  '/analytics',
  '/notifications',
  '/auth-callback',
  '/verify-email',
  '/forgot-password',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Facebot',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'Slackbot',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
