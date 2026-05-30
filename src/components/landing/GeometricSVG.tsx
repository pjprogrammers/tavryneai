'use client'

import { memo } from 'react'

function isometricCube(size: number, hue: number) {
  const h = size
  const w = size * 0.866
  const d = size * 0.5
  return {
    top: `M${w},0 L${w + d},${d} L${w},${d + d} L${w - d},${d} Z`,
    right: `M${w + d},${d} L${w + d},${d + size} L${w},${d + d + size} L${w},${d + d} Z`,
    left: `M${w},${d + d} L${w},${d + d + size} L${w - d},${d + size} L${w - d},${d} Z`,
  }
}

const CrystalSVG = memo(() => (
  <svg viewBox="0 0 120 140" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="crystal-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="crystal-edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
    </defs>
    <polygon points="60,5 105,35 60,65 15,35" fill="url(#crystal-grad)" stroke="url(#crystal-edge)" strokeWidth="1" className="animate-pulse" style={{ animationDuration: '4s' }} />
    <polygon points="60,65 105,35 105,75 60,105 15,75 15,35" fill="url(#crystal-grad)" stroke="url(#crystal-edge)" strokeWidth="1" />
    <polygon points="60,65 60,105 105,75 105,35" fill="#6366f1" fillOpacity="0.08" stroke="url(#crystal-edge)" strokeWidth="0.5" />
    <polygon points="60,65 60,105 15,75 15,35" fill="#a855f7" fillOpacity="0.05" stroke="url(#crystal-edge)" strokeWidth="0.5" />
    <line x1="60" y1="5" x2="60" y2="65" stroke="#818cf8" strokeWidth="0.5" strokeOpacity="0.3" />
    <line x1="60" y1="65" x2="60" y2="105" stroke="#818cf8" strokeWidth="0.5" strokeOpacity="0.3" />
  </svg>
))
CrystalSVG.displayName = 'CrystalSVG'

const Ring3DSVG = memo(() => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="35" rx="35" ry="12" stroke="url(#ring-grad)" strokeWidth="2" fill="none" />
    <ellipse cx="50" cy="55" rx="35" ry="12" stroke="url(#ring-grad)" strokeWidth="2" fill="none" />
    <path d="M15,35 L15,55 M85,35 L85,55 M22,31 L22,51 M78,31 L78,51 M29,28 L29,48 M71,28 L71,48 M36,26 L36,46 M64,26 L64,46" stroke="#818cf8" strokeWidth="1" strokeOpacity="0.4" />
    <ellipse cx="50" cy="45" rx="35" ry="12" stroke="url(#ring-grad)" strokeWidth="1.5" fill="url(#ring-grad)" fillOpacity="0.05" />
  </svg>
))
Ring3DSVG.displayName = 'Ring3DSVG'

const GridSphereSVG = memo(() => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="sphere-grad" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="38" fill="url(#sphere-grad)" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.3" />
    <ellipse cx="50" cy="50" rx="38" ry="15" stroke="#818cf8" strokeWidth="0.8" strokeOpacity="0.25" />
    <ellipse cx="50" cy="50" rx="20" ry="38" stroke="#818cf8" strokeWidth="0.8" strokeOpacity="0.2" />
    <ellipse cx="50" cy="50" rx="32" ry="38" stroke="#a78bfa" strokeWidth="0.5" strokeOpacity="0.15" />
    <path d="M12,50 Q31,20 50,12 Q69,20 88,50 Q69,80 50,88 Q31,80 12,50" stroke="#818cf8" strokeWidth="0.5" strokeOpacity="0.2" />
    <path d="M12,50 Q31,35 50,30 Q69,35 88,50" stroke="#a78bfa" strokeWidth="0.5" strokeOpacity="0.15" />
    <path d="M12,50 Q31,65 50,70 Q69,65 88,50" stroke="#a78bfa" strokeWidth="0.5" strokeOpacity="0.15" />
  </svg>
))
GridSphereSVG.displayName = 'GridSphereSVG'

const Pyramid3DSVG = memo(() => (
  <svg viewBox="0 0 100 120" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="pyramid-left" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="pyramid-right" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="pyramid-base" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <polygon points="50,5 10,45 50,40 90,45" fill="url(#pyramid-base)" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.3" />
    <polygon points="50,5 10,45 10,85 50,115" fill="url(#pyramid-left)" stroke="#818cf8" strokeWidth="0.8" />
    <polygon points="50,5 90,45 90,85 50,115" fill="url(#pyramid-right)" stroke="#a78bfa" strokeWidth="0.8" />
    <polygon points="10,85 50,115 90,85 50,40" fill="url(#pyramid-base)" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.3" />
    <line x1="50" y1="5" x2="50" y2="115" stroke="#818cf8" strokeWidth="0.5" strokeOpacity="0.2" />
  </svg>
))
Pyramid3DSVG.displayName = 'Pyramid3DSVG'

export { CrystalSVG, Ring3DSVG, GridSphereSVG, Pyramid3DSVG }

export function DecorativeShape({ type, className }: { type: 'crystal' | 'ring' | 'sphere' | 'pyramid'; className?: string }) {
  const Component = { crystal: CrystalSVG, ring: Ring3DSVG, sphere: GridSphereSVG, pyramid: Pyramid3DSVG }[type]
  return (
    <div className={`opacity-40 ${className || ''}`}>
      <Component />
    </div>
  )
}
