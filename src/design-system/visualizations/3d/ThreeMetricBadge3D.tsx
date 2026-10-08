import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { SeverityLevel } from '../../../types/risk';

export type MetricBadgeShape = 'gyro' | 'cube' | 'delta' | 'torus' | 'sparkle';

interface ThreeMetricBadge3DProps {
  shape?: MetricBadgeShape;
  severity?: SeverityLevel;
  sentiment?: 'positive' | 'negative' | 'neutral';
  size?: number; // width & height in px
  className?: string;
  isInteractive?: boolean;
}

export const ThreeMetricBadge3D: React.FC<ThreeMetricBadge3DProps> = ({
  shape = 'gyro',
  severity,
  sentiment = 'neutral',
  size = 42,
  className = '',
  isInteractive = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // Pick color
    let colorHex = 0x38bdf8; // Default cyber cyan
    if (severity === 'critical' || sentiment === 'negative') {
      colorHex = 0xff4b4b;
    } else if (severity === 'high') {
      colorHex = 0xff922b;
    } else if (severity === 'medium') {
      colorHex = 0xfcc419;
    } else if (sentiment === 'positive') {
      colorHex = 0x34d399; // Emerald green
    }

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const light = new THREE.PointLight(colorHex, 2.8, 10);
    light.position.set(2, 2, 3);
    scene.add(light);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambLight);

    // 4. Object Group
    const group = new THREE.Group();
    scene.add(group);

    const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

    if (shape === 'gyro') {
      // Gyro Core Sphere
      const coreGeom = new THREE.SphereGeometry(0.5, 16, 16);
      const coreMat = new THREE.MeshPhongMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        shininess: 80
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      group.add(core);
      disposables.push(coreGeom, coreMat);

      // Ring 1
      const ring1Geom = new THREE.TorusGeometry(1.2, 0.05, 8, 24);
      const ring1Mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.8 });
      const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
      group.add(ring1);
      disposables.push(ring1Geom, ring1Mat);

      // Ring 2
      const ring2Geom = new THREE.TorusGeometry(1.5, 0.04, 8, 24);
      const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
      const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
      ring2.rotation.x = Math.PI / 2;
      group.add(ring2);
      disposables.push(ring2Geom, ring2Mat);
    } else if (shape === 'cube') {
      // Wireframe Box + Inner glowing core
      const boxGeom = new THREE.BoxGeometry(1.4, 1.4, 1.4);
      const boxMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
        transparent: true,
        opacity: 0.75
      });
      const box = new THREE.Mesh(boxGeom, boxMat);
      group.add(box);
      disposables.push(boxGeom, boxMat);

      const innerGeom = new THREE.OctahedronGeometry(0.6, 0);
      const innerMat = new THREE.MeshPhongMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.5
      });
      const inner = new THREE.Mesh(innerGeom, innerMat);
      group.add(inner);
      disposables.push(innerGeom, innerMat);
    } else if (shape === 'delta') {
      // 3D Cone / Arrow
      const coneGeom = new THREE.ConeGeometry(0.9, 1.6, 6);
      if (sentiment === 'negative' || severity === 'critical') {
        coneGeom.rotateX(Math.PI); // Point down
      }
      const coneMat = new THREE.MeshPhongMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.7,
        wireframe: true
      });
      const cone = new THREE.Mesh(coneGeom, coneMat);
      group.add(cone);
      disposables.push(coneGeom, coneMat);

      const ringGeom = new THREE.TorusGeometry(1.2, 0.04, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      disposables.push(ringGeom, ringMat);
    } else {
      // Torus Knot or Torus
      const torusGeom = new THREE.TorusKnotGeometry(0.8, 0.22, 48, 8, 2, 3);
      const torusMat = new THREE.MeshPhongMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.5,
        wireframe: true
      });
      const torus = new THREE.Mesh(torusGeom, torusMat);
      group.add(torus);
      disposables.push(torusGeom, torusMat);
    }

    // Mouse interactivity
    const onMouseMove = (e: MouseEvent) => {
      if (!isInteractive) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Smooth spin
      group.rotation.y = elapsed * 1.5 + mouseRef.current.x * 0.5;
      group.rotation.x = elapsed * 0.8 + mouseRef.current.y * 0.5;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      disposables.forEach(d => d.dispose());
    };
  }, [shape, severity, sentiment, size, isInteractive]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className={`inline-block relative shrink-0 overflow-hidden ${className}`}
    />
  );
};
