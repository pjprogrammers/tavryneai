import { ImageResponse } from 'next/og';

const TITLE = 'Tavryne AI – AI Website & App Builder';
const DESCRIPTION = 'Build production-ready websites, web apps, and SaaS products with AI through natural conversation. No coding required.';

export const alt = TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 40%, #6366F1 70%, #4338CA 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 50% 40% at 20% 80%, rgba(167,139,250,0.2) 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 90% 20%, rgba(129,140,248,0.15) 0%, transparent 50%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: 28,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: 28,
          }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            margin: 0,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            lineHeight: 1.15,
          }}
        >
          Tavryne AI
        </h1>
        <p
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.85)',
            margin: '12px 0 0',
            textAlign: 'center',
            maxWidth: 650,
            lineHeight: 1.4,
            fontWeight: 400,
          }}
        >
          {DESCRIPTION}
        </p>
      </div>
    ),
    { ...size },
  );
}
