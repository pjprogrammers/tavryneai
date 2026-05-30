'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'

const ThreeScene = dynamic(() => import('./ThreeScene').then(m => ({ default: m.ThreeScene })), {
  ssr: false,
  loading: () => null,
})

export function ParticleContainer() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <ThreeScene />
    </Suspense>
  )
}
