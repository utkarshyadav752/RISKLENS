import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../context/DashboardContext';

export type BackgroundThemeMode =
  | 'nebula'
  | 'constellation'
  | 'cyber-rings'
  | 'quantum-grid'
  | 'hyperdrive'
  | 'off';

export interface ThreeBackground3DProps {
  mode?: BackgroundThemeMode;
  intensity?: number; // 0.1 to 1.0
}

export const ThreeBackground3D: React.FC<ThreeBackground3DProps> = ({
  mode = 'quantum-grid',
  intensity = 0.85
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { threatLevel, isSimulationMode, isCircuitBreakerTripped } = useDashboard();

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (mode === 'off' || !containerRef.current) return;
    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x060910, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 14, 46);
    camera.lookAt(0, 0, -25);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const alertColor = isCircuitBreakerTripped
      ? 0xff2222
      : isSimulationMode
      ? 0xff5500
      : threatLevel === 'crisis'
      ? 0xff3333
      : threatLevel === 'elevated'
      ? 0xf59e0b
      : 0x0ea5e9;

    // Dynamic mouse tracker point light
    const mouseLight = new THREE.PointLight(alertColor, 3.2 * intensity, 110);
    mouseLight.position.set(0, 10, 20);
    scene.add(mouseLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2.4 * intensity, 120);
    cyanLight.position.set(-35, 25, -10);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 2.2 * intensity, 100);
    purpleLight.position.set(35, 15, -20);
    scene.add(purpleLight);

    // 5. Undulating Cyber Grid Ground (Dual Layer)
    const gridSegments = 70;
    const gridWidth = 160;
    const gridHeight = 160;
    const terrainGeom = new THREE.PlaneGeometry(gridWidth, gridHeight, gridSegments, gridSegments);
    terrainGeom.rotateX(-Math.PI / 2);

    const terrainMat = new THREE.MeshBasicMaterial({
      color: isCircuitBreakerTripped ? 0xef4444 : isSimulationMode ? 0xf97316 : 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.22 * intensity
    });
    const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
    terrainMesh.position.y = -9;
    scene.add(terrainMesh);

    // Secondary ceiling inverse grid for immersive depth
    const ceilingGeom = new THREE.PlaneGeometry(gridWidth, gridHeight, 40, 40);
    ceilingGeom.rotateX(Math.PI / 2);
    const ceilingMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.06 * intensity
    });
    const ceilingMesh = new THREE.Mesh(ceilingGeom, ceilingMat);
    ceilingMesh.position.y = 35;
    scene.add(ceilingMesh);

    // 6. Floating Crystal Polyhedra Shards
    const shardsGroup = new THREE.Group();
    scene.add(shardsGroup);
    const shards: THREE.Mesh[] = [];

    const shardGeometries = [
      new THREE.IcosahedronGeometry(1.8, 0),
      new THREE.DodecahedronGeometry(1.6, 0),
      new THREE.OctahedronGeometry(1.5, 0)
    ];

    for (let i = 0; i < 16; i++) {
      const g = shardGeometries[i % shardGeometries.length];
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? alertColor : 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: (0.15 + (i % 3) * 0.08) * intensity
      });
      const mesh = new THREE.Mesh(g, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 110,
        Math.random() * 32 - 4,
        (Math.random() - 0.5) * 90 - 15
      );
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.018,
        floatSpeed: 0.5 + Math.random() * 0.8,
        baseY: mesh.position.y
      };
      shardsGroup.add(mesh);
      shards.push(mesh);
    }

    // 7. Giant Celestial Holographic Gyro Rings (for cyber-rings or quantum-grid)
    const gyroGroup = new THREE.Group();
    gyroGroup.position.set(0, 18, -35);
    scene.add(gyroGroup);

    const ringGeom1 = new THREE.TorusGeometry(18, 0.12, 8, 80);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28 * intensity
    });
    const ring1 = new THREE.Mesh(ringGeom1, ringMat1);
    gyroGroup.add(ring1);

    const ringGeom2 = new THREE.TorusGeometry(22, 0.08, 8, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: alertColor,
      transparent: true,
      opacity: 0.22 * intensity
    });
    const ring2 = new THREE.Mesh(ringGeom2, ringMat2);
    ring2.rotation.x = Math.PI / 3;
    gyroGroup.add(ring2);

    const ringGeom3 = new THREE.TorusGeometry(26, 0.06, 8, 80);
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.18 * intensity
    });
    const ring3 = new THREE.Mesh(ringGeom3, ringMat3);
    ring3.rotation.y = Math.PI / 4;
    gyroGroup.add(ring3);

    // 8. Particle Constellation / Hyperdrive Dust
    const particleCount = mode === 'hyperdrive' ? 1800 : mode === 'constellation' ? 1400 : 950;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseCol = new THREE.Color(alertColor);
    const cyanCol = new THREE.Color(0x38bdf8);
    const purpleCol = new THREE.Color(0xa855f7);
    const goldCol = new THREE.Color(0xfbbf24);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 130;
      particlePositions[i * 3 + 1] = Math.random() * 55 - 12;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const mix = Math.random();
      const pColor =
        mix < 0.35 ? cyanCol : mix < 0.65 ? purpleCol : mix < 0.85 ? baseCol : goldCol;
      particleColors[i * 3] = pColor.r;
      particleColors[i * 3 + 1] = pColor.g;
      particleColors[i * 3 + 2] = pColor.b;
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: mode === 'hyperdrive' ? 1.4 : 0.95,
      vertexColors: true,
      transparent: true,
      opacity: 0.75 * intensity,
      blending: THREE.AdditiveBlending
    });
    const particleCloud = new THREE.Points(particleGeom, particleMat);
    scene.add(particleCloud);

    // 9. Mouse Parallax Tracker
    const onMouseMove = (e: MouseEvent) => {
      mousePosRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePosRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const time = clock.getElapsedTime();

      // Smooth camera parallax
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.04;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.04;

      if (cameraRef.current) {
        cameraRef.current.position.x = mousePosRef.current.x * 7;
        cameraRef.current.position.y = 14 - mousePosRef.current.y * 3.5;
        cameraRef.current.lookAt(0, 0, -25);
      }

      // Mouse light movement
      mouseLight.position.x = mousePosRef.current.x * 25;
      mouseLight.position.y = 12 - mousePosRef.current.y * 15;

      // Terrain wave undulating
      const posAttr = terrainGeom.attributes.position;
      const waveSpeed = isSimulationMode ? 2.6 : 1.3;
      const waveAmp = isSimulationMode ? 3.2 : 1.6;

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        const mouseDist = Math.hypot(x - mousePosRef.current.x * 40, z);
        const mouseRipple = Math.sin(mouseDist * 0.2 - time * 3) * 0.4;
        const wave =
          Math.sin(x * 0.07 + time * waveSpeed) * Math.cos(z * 0.07 + time * waveSpeed) * waveAmp;
        posAttr.setY(i, wave + mouseRipple);
      }
      posAttr.needsUpdate = true;

      // Floating shards tumble
      shards.forEach((s, idx) => {
        s.rotation.x += s.userData.rotSpeedX;
        s.rotation.y += s.userData.rotSpeedY;
        s.position.y =
          s.userData.baseY + Math.sin(time * s.userData.floatSpeed + idx) * 1.8;
      });

      // Gyro rings spin
      gyroGroup.rotation.y = time * 0.05;
      ring1.rotation.x = time * 0.04;
      ring2.rotation.y = -time * 0.06;
      ring3.rotation.z = time * 0.03;

      // Particle cloud movement
      if (mode === 'hyperdrive') {
        const pPos = particleGeom.attributes.position;
        for (let i = 0; i < particleCount; i++) {
          let z = pPos.getZ(i) + 0.8;
          if (z > 40) z = -80;
          pPos.setZ(i, z);
        }
        pPos.needsUpdate = true;
      } else {
        particleCloud.rotation.y = time * 0.02;
        particleCloud.rotation.x = Math.sin(time * 0.015) * 0.05;
      }

      // Orbiting lights
      cyanLight.position.x = Math.sin(time * 0.4) * 45;
      cyanLight.position.z = Math.cos(time * 0.4) * 35;
      purpleLight.position.x = Math.cos(time * 0.3) * 40;
      purpleLight.position.z = Math.sin(time * 0.3) * 40;

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    // 11. Window Resize
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      terrainGeom.dispose();
      terrainMat.dispose();
      ceilingGeom.dispose();
      ceilingMat.dispose();
      ringGeom1.dispose();
      ringMat1.dispose();
      ringGeom2.dispose();
      ringMat2.dispose();
      ringGeom3.dispose();
      ringMat3.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      shardGeometries.forEach(g => g.dispose());
    };
  }, [mode, intensity, threatLevel, isSimulationMode, isCircuitBreakerTripped]);

  if (mode === 'off') return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-95 transition-opacity duration-700"
      style={{
        background:
          mode === 'hyperdrive'
            ? 'radial-gradient(circle at 50% 50%, #0c1220 0%, #060910 70%, #030408 100%)'
            : 'radial-gradient(ellipse at 50% 20%, #111827 0%, #090e17 60%, #04060a 100%)'
      }}
      aria-hidden="true"
    />
  );
};
