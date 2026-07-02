'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface WorkbenchBackgroundProps {
  reducedMotion?: boolean;
}

/**
 * A lightweight, mobile-friendly 3D backdrop for the project workbench.
 * Renders 3 floating low-poly shapes (icosahedron, torus, octahedron)
 * with a soft aurora gradient. Mouse-aware and respects reduced-motion.
 */
export function WorkbenchBackground({ reducedMotion = false }: WorkbenchBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Aurora plane (subtle gradient backdrop)
    const auroraGeo = new THREE.PlaneGeometry(40, 24);
    const auroraMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          vec2 p = vUv - 0.5;
          float d = length(p);
          float t = uTime * 0.15;
          vec3 a = vec3(0.62, 0.45, 0.95);
          vec3 b = vec3(0.30, 0.65, 0.95);
          vec3 c = vec3(0.95, 0.45, 0.70);
          float mixA = 0.5 + 0.5 * sin(d * 6.0 - t);
          float mixB = 0.5 + 0.5 * sin(vUv.x * 4.0 + t);
          vec3 col = mix(mix(a, b, mixB), c, mixA * 0.35);
          float alpha = (1.0 - smoothstep(0.0, 0.7, d)) * 0.55;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    const aurora = new THREE.Mesh(auroraGeo, auroraMat);
    aurora.position.z = -6;
    scene.add(aurora);

    // Floating shapes
    const matA = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.62, 0.45, 0.95),
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const matB = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.30, 0.65, 0.95),
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const matC = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.95, 0.45, 0.70),
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), matA);
    ico.position.set(-3.2, 0.8, 0);
    group.add(ico);

    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.35, 12, 32), matB);
    torus.position.set(3.2, -0.5, -1);
    group.add(torus);

    const octa = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), matC);
    octa.position.set(0.4, -2.0, -2);
    group.add(octa);

    // Mouse parallax
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // Animate
    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();

      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;

      if (!reducedMotion) {
        ico.rotation.x += dt * 0.18;
        ico.rotation.y += dt * 0.22;
        torus.rotation.x += dt * 0.25;
        torus.rotation.z += dt * 0.15;
        octa.rotation.y += dt * 0.3;
        octa.rotation.z += dt * 0.2;

        ico.position.y = 0.8 + Math.sin(t * 0.6) * 0.25;
        torus.position.y = -0.5 + Math.cos(t * 0.5) * 0.2;
        octa.position.y = -2.0 + Math.sin(t * 0.4 + 1) * 0.18;
      }

      group.rotation.x = mouse.y * 0.18;
      group.rotation.y = mouse.x * 0.22;

      (auroraMat.uniforms.uTime.value as number) = t;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouse);
      ico.geometry.dispose();
      torus.geometry.dispose();
      octa.geometry.dispose();
      auroraGeo.dispose();
      auroraMat.dispose();
      matA.dispose();
      matB.dispose();
      matC.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
    />
  );
}
