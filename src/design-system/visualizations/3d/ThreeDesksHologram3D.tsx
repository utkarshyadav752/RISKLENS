import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../../context/DashboardContext';
import { RotateCw, Cpu, ZoomIn, ZoomOut, AlertOctagon } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ThreeDesksHologram3DProps {
  className?: string;
  height?: number;
}

export const ThreeDesksHologram3D: React.FC<ThreeDesksHologram3DProps> = ({
  className,
  height = 360
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tradingDesks, isCircuitBreakerTripped } = useDashboard();
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
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

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 10, 18);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0x60a5fa, 2.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 4. Master Group & Grid Platform
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const grid = new THREE.GridHelper(18, 18, 0x3b82f6, 0x1f2736);
    grid.position.y = 0;
    group.add(grid);

    // 5. Build 3D Holographic Towers for Desks
    const towerMeshes: { mesh: THREE.Mesh; forcefield: THREE.Mesh; deskId: string; baseHeight: number }[] = [];
    const spacing = 3.2;
    const startX = -((tradingDesks.length - 1) * spacing) / 2;

    tradingDesks.forEach((desk, idx) => {
      const x = startX + idx * spacing;
      const targetHeight = (desk.marginUtilizationPct / 100) * 8 + 1.2;

      // Holographic Tower Cylinder / Box
      const towerGeom = new THREE.BoxGeometry(1.8, targetHeight, 1.8);
      const isFrozen = desk.status === 'frozen' || isCircuitBreakerTripped;

      const towerColor = isFrozen ? 0xff6b6b : desk.marginUtilizationPct > 85 ? 0xff922b : 0x3b82f6;

      const towerMat = new THREE.MeshStandardMaterial({
        color: towerColor,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: isFrozen ? 0.4 : 0.85,
        wireframe: false
      });

      const towerMesh = new THREE.Mesh(towerGeom, towerMat);
      towerMesh.position.set(x, targetHeight / 2, 0);
      group.add(towerMesh);

      // Wireframe overlay on the tower
      const wireGeom = new THREE.WireframeGeometry(towerGeom);
      const wireMat = new THREE.LineBasicMaterial({ color: isFrozen ? 0xff6b6b : 0x60a5fa, transparent: true, opacity: 0.7 });
      const wire = new THREE.LineSegments(wireGeom, wireMat);
      towerMesh.add(wire);

      // Containment Forcefield Cage (appears when frozen)
      const fieldGeom = new THREE.CylinderGeometry(1.6, 1.6, targetHeight + 1.5, 12, 1, true);
      const fieldMat = new THREE.MeshBasicMaterial({
        color: 0xff6b6b,
        wireframe: true,
        transparent: true,
        opacity: isFrozen ? 0.75 : 0.0
      });
      const forcefield = new THREE.Mesh(fieldGeom, fieldMat);
      forcefield.position.set(x, targetHeight / 2, 0);
      group.add(forcefield);

      towerMeshes.push({ mesh: towerMesh, forcefield, deskId: desk.id, baseHeight: targetHeight });
    });

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (autoRotate && !isDraggingRef.current && groupRef.current) {
        groupRef.current.rotation.y += 0.003;
      }

      // Pulse towers & spin containment forcefield
      towerMeshes.forEach((t, i) => {
        const isFrozen = isCircuitBreakerTripped || tradingDesks.find(d => d.id === t.deskId)?.status === 'frozen';
        if (isFrozen) {
          t.forcefield.rotation.y += 0.02;
          (t.forcefield.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(elapsed * 6) * 0.35;
        } else {
          // Subtle height breathing
          const microPulse = 1 + Math.sin(elapsed * 2.5 + i) * 0.03;
          t.mesh.scale.set(1, microPulse, 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 7. Mouse drag
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !groupRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      groupRef.current.rotation.y += deltaX * 0.006;
      camera.position.y = Math.max(4, Math.min(16, camera.position.y - deltaY * 0.03));
      camera.lookAt(0, 2, 0);

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
    };
  }, [height, tradingDesks, isCircuitBreakerTripped]);

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(10, Math.min(28, cameraRef.current.position.z + delta));
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
          <Cpu size={14} className="text-blue-400" />
          <span className="font-mono text-xs font-bold tracking-wider text-[#F1F3F5] uppercase">
            3D Holographic Algorithmic Desks
          </span>
          {isCircuitBreakerTripped && (
            <span className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-400 font-mono text-[10px] font-bold animate-pulse flex items-center gap-1">
              <AlertOctagon size={11} /> FORCEFIELD CONTAINMENT ENGAGED
            </span>
          )}
        </div>
        <p className="text-[11px] font-mono text-[#94A3B8]">
          Tower Heights = Margin Consumption % · Real-Time Forcefield Shields
        </p>
      </div>

      {/* Desk Pills Footer */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 overflow-x-auto pb-1 pointer-events-none">
        {tradingDesks.map(desk => {
          const isFrozen = desk.status === 'frozen' || isCircuitBreakerTripped;
          return (
            <div
              key={desk.id}
              className={cn(
                'px-2.5 py-1 rounded bg-[#151B26]/85 backdrop-blur-md border text-[11px] font-mono flex items-center gap-2 shrink-0 shadow-lg',
                isFrozen ? 'border-red-500/50 text-red-300' : 'border-[#273142] text-[#F1F3F5]'
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', isFrozen ? 'bg-red-500 animate-ping' : 'bg-blue-400')} />
              <span className="font-bold truncate max-w-[110px]">{desk.name.split(' ')[0]}</span>
              <span className={cn('tabular-nums font-semibold', isFrozen ? 'text-red-400' : 'text-blue-400')}>
                {desk.marginUtilizationPct.toFixed(0)}%
              </span>
            </div>
          );
        })}
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
