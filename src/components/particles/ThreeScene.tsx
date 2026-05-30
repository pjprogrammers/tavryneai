'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const STAR_COUNT = 4000
const ARM_COUNT = 4
const GALAXY_RADIUS = 14
const ARM_SPREAD = 0.45
const CORE_RADIUS = 2.5
const TILT_ANGLE = 0.3

interface Star {
  angle: number
  radius: number
  yOff: number
  speed: number
  size: number
  phase: number
}

export function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 3, 16)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const stars: Star[] = []
    const positions = new Float32Array(STAR_COUNT * 3)
    const colors = new Float32Array(STAR_COUNT * 3)
    const sizes = new Float32Array(STAR_COUNT)

    const tempColor = new THREE.Color()

    for (let i = 0; i < STAR_COUNT; i++) {
      const isCore = i < STAR_COUNT * 0.2
      let r: number, angle: number, yOff: number

      if (isCore) {
        r = Math.random() * CORE_RADIUS
        angle = Math.random() * Math.PI * 2
        yOff = (Math.random() - 0.5) * 0.8
      } else {
        const armIndex = Math.floor(Math.random() * ARM_COUNT)
        const armAngle = (armIndex / ARM_COUNT) * Math.PI * 2
        const radiusFactor = 0.3 + Math.random() * 0.7
        r = CORE_RADIUS + (GALAXY_RADIUS - CORE_RADIUS) * radiusFactor
        const spiralAngle = r * 0.45 + armAngle
        const scatter = (Math.random() - 0.5) * ARM_SPREAD * (r / GALAXY_RADIUS)
        angle = spiralAngle + scatter
        const heightFactor = (r - CORE_RADIUS) / (GALAXY_RADIUS - CORE_RADIUS)
        yOff = (Math.random() - 0.5) * 0.3 * (1 + heightFactor)
      }

      const x = r * Math.cos(angle)
      const z = r * Math.sin(angle)
      const y = yOff * Math.sin(r * 0.5)

      const cosTilt = Math.cos(TILT_ANGLE)
      const sinTilt = Math.sin(TILT_ANGLE)
      positions[i * 3] = x * cosTilt - y * sinTilt
      positions[i * 3 + 1] = x * sinTilt + y * cosTilt
      positions[i * 3 + 2] = z

      const distFromCenter = r / GALAXY_RADIUS
      if (isCore) {
        tempColor.setHSL(0.6, 0.3, 0.7 + Math.random() * 0.3)
      } else {
        const hue = 0.65 - distFromCenter * 0.25
        const sat = 0.6 + Math.random() * 0.3
        const light = 0.4 + Math.random() * 0.4 * (1 - distFromCenter * 0.5)
        tempColor.setHSL(hue, sat, light)
      }
      colors[i * 3] = tempColor.r
      colors[i * 3 + 1] = tempColor.g
      colors[i * 3 + 2] = tempColor.b

      sizes[i] = isCore
        ? 0.04 + Math.random() * 0.08
        : 0.02 + Math.random() * 0.06 * (1 - distFromCenter * 0.3)

      const keplerFactor = isCore ? 0.8 + Math.random() * 0.2 : 1 / Math.sqrt(Math.max(r, 1))
      stars.push({
        angle,
        radius: r,
        yOff,
        speed: keplerFactor * 0.15,
        size: sizes[i],
        phase: Math.random() * Math.PI * 2,
      })
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(geo, mat)
    scene.add(points)

    // --- Glow core ---
    const glowGeo = new THREE.SphereGeometry(1.2, 16, 16)
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.4, 0.5, 1),
      transparent: true,
      opacity: 0.15,
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    scene.add(glow)

    // --- Mouse ---
    const mouse = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    const onMouse = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    // --- Resize ---
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // --- Animation ---
    const posAttr = geo.attributes.position.array as Float32Array
    const clock = new THREE.Clock()
    let animId: number

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05)
      const elapsed = clock.getElapsedTime()

      mouse.x += (target.x - mouse.x) * 0.03
      mouse.y += (target.y - mouse.y) * 0.03

      points.rotation.y += delta * 0.04
      points.rotation.x += (mouse.y * 0.15 - points.rotation.x) * 0.015
      points.rotation.z += (-mouse.x * 0.08 - points.rotation.z) * 0.015

      glow.rotation.x = points.rotation.x * 0.5
      glow.rotation.y = points.rotation.y * 0.5

      const pulse = 0.12 + Math.sin(elapsed * 0.3) * 0.03
      glowMat.opacity = pulse

      renderer.render(scene, camera)
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 -z-10" />
}
