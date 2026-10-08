import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { SeverityLevel } from '../../../types/risk';

interface ThreeAlertMiniBeacon3DProps {
  severity?: SeverityLevel;
  size?: number; // width & height in px
  className?: string;
  isPulsing?: boolean;
}

export const ThreeAlertMiniBeacon3D: React.FC<ThreeAlertMiniBeacon3DProps> = ({
  severity = 'critical',
  size = 44,
  className = '',
  isPulsing = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // Severity colors
    const colorHex =
      severity === 'critical'
        ? 0xff3b3b
        : severity === 'high'
        ? 0xff922b
        : severity === 'medium'
        ? 0xfcc419
        : 0x51cf66;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);

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

    // 3. Central 3D Alert Core (Octahedron / Prism)
    const coreGeom = new THREE.OctahedronGeometry(1.0, 0);
    const coreMat = new THREE.MeshPhongMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.65,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
      shininess: 90
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    scene.add(coreMesh);

    // Wireframe cage
    const wireGeom = new THREE.OctahedronGeometry(1.15, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    scene.add(wireMesh);

    // 4. Orbiting Gyro Ring
    const ringGeom = new THREE.TorusGeometry(1.6, 0.04, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.7
    });
    const ringMesh1 = new THREE.Mesh(ringGeom, ringMat);
    ringMesh1.rotation.x = Math.PI / 3;
    scene.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(ringGeom, ringMat);
    ringMesh2.rotation.y = Math.PI / 3;
    scene.add(ringMesh2);

    // 5. Lighting
    const pointLight = new THREE.PointLight(colorHex, 2.5, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 6. Animation
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const speed = severity === 'critical' ? 2.8 : severity === 'high' ? 2.0 : 1.2;

      coreMesh.rotation.y = elapsed * speed;
      coreMesh.rotation.x = elapsed * (speed * 0.6);

      wireMesh.rotation.y = -elapsed * (speed * 0.8);
      wireMesh.rotation.z = elapsed * (speed * 0.5);

      ringMesh1.rotation.z = elapsed * speed;
      ringMesh2.rotation.x = -elapsed * speed * 0.9;

      if (isPulsing) {
        const pulse = 1 + Math.sin(elapsed * speed * 3) * 0.12;
        coreMesh.scale.set(pulse, pulse, pulse);
        wireMesh.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
    };
  }, [severity, size, isPulsing]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className={`inline-block relative shrink-0 ${className}`}
      title={`${severity.toUpperCase()} 3D Threat Beacon`}
    />
  );
};
