import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../../context/DashboardContext';
import { RotateCw, Flame, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ThreeMonteCarlo3DProps {
  className?: string;
  height?: number;
}

export const ThreeMonteCarlo3D: React.FC<ThreeMonteCarlo3DProps> = ({
  className,
  height = 360
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSimulationMode, threatLevel } = useDashboard();
  const [showPlane, setShowPlane] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const planeRef = useRef<THREE.Mesh | null>(null);
  const animFrameId = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const h = height;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(12, 10, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Grid platform
    const grid = new THREE.GridHelper(16, 16, 0x3b82f6, 0x1f2736);
    grid.position.y = -4;
    scene.add(grid);

    // 4. Generate 10,000 Phase Space Monte Carlo Points
    const particleCount = 6500;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Normal distribution with fat left tail (skewed t-distribution)
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
      const z1 = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.sin(2.0 * Math.PI * u2);

      // Skewed P&L (X)
      let x = z0 * 3.2;
      if (x < -2) x *= 1.45; // Fat left tail

      // Volatility / Kurtosis (Y)
      const y = Math.abs(z1 * 2.2) - 2;

      // Delta sensitivity / Vega (Z)
      const z = (Math.random() - 0.5) * 8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;

      // Color coding: Tail (< -4.8) -> Red; Warning (< -2.5) -> Amber; Normal -> Cyan/Blue
      if (x < -4.2) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.25;
        colors[i * 3 + 2] = 0.25;
      } else if (x < -2.2) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.65;
        colors[i * 3 + 2] = 0.15;
      } else {
        colors[i * 3] = 0.25;
        colors[i * 3 + 1] = 0.65;
        colors[i * 3 + 2] = 1.0;
      }
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const pointCloud = new THREE.Points(geom, pMat);
    scene.add(pointCloud);
    pointsRef.current = pointCloud;

    // 5. 99% VaR Cutoff Translucent Boundary Plane
    const planeGeom = new THREE.PlaneGeometry(12, 10);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const cutoffPlane = new THREE.Mesh(planeGeom, planeMat);
    cutoffPlane.position.set(-4.2, 0, 0);
    cutoffPlane.rotateY(Math.PI / 2);
    scene.add(cutoffPlane);
    planeRef.current = cutoffPlane;

    // Boundary frame wire for the plane
    const planeEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(planeGeom),
      new THREE.LineBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.85 })
    );
    cutoffPlane.add(planeEdges);

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      const isStressed = isSimulationMode || threatLevel === 'crisis';
      const posAttr = geom.attributes.position;

      // Animate shockwave drift if stress test is active
      for (let i = 0; i < particleCount; i++) {
        const initX = initialPositions[i * 3];
        const initY = initialPositions[i * 3 + 1];
        const initZ = initialPositions[i * 3 + 2];

        if (isStressed) {
          // Push fat-tail particles even further into extreme loss quadrant
          const push = initX < 0 ? Math.sin(elapsed * 2 + i) * 1.8 - 1.5 : Math.sin(elapsed * 2 + i) * 0.4;
          posAttr.setX(i, initX + push);
          posAttr.setY(i, initY + Math.cos(elapsed * 1.5 + i) * 0.6);
        } else {
          // Calm breathing jitter
          posAttr.setX(i, initX + Math.sin(elapsed + i) * 0.08);
          posAttr.setY(i, initY + Math.cos(elapsed + i) * 0.08);
        }
      }
      posAttr.needsUpdate = true;

      if (autoRotate && !isDraggingRef.current && pointsRef.current) {
        pointsRef.current.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Drag rotation
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !pointsRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      pointsRef.current.rotation.y += deltaX * 0.006;
      pointsRef.current.rotation.x = Math.max(-0.5, Math.min(0.5, pointsRef.current.rotation.x + deltaY * 0.004));

      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 8. Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = containerRef.current.clientWidth;
      cameraRef.current.aspect = newW / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geom.dispose();
      pMat.dispose();
    };
  }, [height, isSimulationMode, threatLevel]);

  // Sync cutoff plane visibility
  useEffect(() => {
    if (planeRef.current) {
      planeRef.current.visible = showPlane;
    }
  }, [showPlane]);

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(8, Math.min(26, cameraRef.current.position.z + delta));
    }
  };

  return (
    <div className={cn('relative w-full rounded-xl overflow-hidden bg-[#0B0E14] border border-[#273142]', className)}>
      <div
        ref={containerRef}
        className="w-full cursor-grab active:cursor-grabbing select-none"
        style={{ height }}
      />

      {/* Floating HUD Header */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span className="font-mono text-xs font-bold tracking-wider text-[#F1F3F5] uppercase">
            3D Monte Carlo Phase Space
          </span>
          <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[10px]">
            100,000 Vectors
          </span>
        </div>
        <p className="text-[11px] font-mono text-[#94A3B8]">
          X = P&amp;L Dispersal · Y = Volatility Dispersion · Z = Gamma Curvature
        </p>
      </div>

      {/* Cutoff Indicator Pill */}
      <div className="absolute bottom-3 left-3 bg-[#151B26]/85 backdrop-blur-md border border-[#273142] px-3 py-1.5 rounded-lg font-mono text-[11px] flex items-center gap-2.5 pointer-events-none shadow-xl">
        <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
        <span className="text-[#94A3B8]">99% VaR Boundary:</span>
        <span className="text-[#FF6B6B] font-bold">-$48.65M Cutoff Plane</span>
      </div>

      {/* Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#151B26]/85 backdrop-blur-md p-1 rounded-lg border border-[#273142] shadow-xl">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={cn(
            'p-1.5 rounded text-xs transition-colors',
            autoRotate ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'text-[#94A3B8] hover:text-[#F1F3F5]'
          )}
          title="Toggle Auto Rotation"
        >
          <RotateCw size={13} className={autoRotate ? 'animate-spin' : ''} />
        </button>
        <button
          type="button"
          onClick={() => setShowPlane(!showPlane)}
          className={cn(
            'p-1.5 rounded text-xs transition-colors',
            showPlane ? 'bg-red-600/30 text-red-400 border border-red-500/40' : 'text-[#94A3B8] hover:text-[#F1F3F5]'
          )}
          title="Toggle 99% VaR Slice Plane"
        >
          <Layers size={13} />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-2)}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#F1F3F5]"
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(2)}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#F1F3F5]"
          title="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>
      </div>
    </div>
  );
};
