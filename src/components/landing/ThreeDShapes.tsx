'use client'

import { useEffect, useRef } from 'react'

export function ThreeDShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const shapes: { x: number; y: number; vx: number; vy: number; size: number; sides: number; rotation: number; rotSpeed: number; color: string; opacity: number }[] = []

    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899']

    const resize = () => {
      const parent = canvas.parentElement
      canvas.width = parent?.offsetWidth || window.innerWidth
      canvas.height = parent?.offsetHeight || window.innerHeight
    }

    const init = () => {
      resize()
      const count = Math.min(20, Math.floor((canvas.width * canvas.height) / 30000))
      shapes.length = 0
      for (let i = 0; i < count; i++) {
        shapes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: 15 + Math.random() * 40,
          sides: [3, 4, 5, 6, 8, 12][Math.floor(Math.random() * 6)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.15 + Math.random() * 0.15,
        })
      }
    }

    const drawShape = (s: typeof shapes[0]) => {
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(s.rotation)
      ctx.beginPath()
      const angle = (Math.PI * 2) / s.sides
      for (let i = 0; i <= s.sides; i++) {
        const px = Math.cos(angle * i) * s.size
        const py = Math.sin(angle * i) * s.size
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.strokeStyle = s.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = s.opacity
      ctx.stroke()
      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const s of shapes) {
        s.x += s.vx
        s.y += s.vy
        s.rotation += s.rotSpeed

        if (s.x < -s.size) s.x = canvas.width + s.size
        if (s.x > canvas.width + s.size) s.x = -s.size
        if (s.y < -s.size) s.y = canvas.height + s.size
        if (s.y > canvas.height + s.size) s.y = -s.size

        drawShape(s)
      }

      animationId = requestAnimationFrame(animate)
    }

    init()
    animate()

    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationId)
      ro.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: -5 }} />
}
