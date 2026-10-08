import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../../context/DashboardContext';
import { RotateCw, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ThreeWaterfall3DProps {
  height?: number;
  className?: string;
}

interface ExposureFactorItem {
  id: string;
  name: string;
  exposureBaseM: number;
  exposureShockM: number;
  colorHex: number;
  deltaPercent: number;
}

const FACTORS: ExposureFactorItem[] = [
  { id: 'eq', name: 'Equities Beta', exposureBaseM: 18.5, exposureShockM: 29.8, colorHex: 0x38bdf8, deltaPercent: 3.2 },
  { id: 'rates', name: 'Rates Curve', exposureBaseM: 12.4, exposureShockM: 18.9, colorHex: 0x818cf8, deltaPercent: -1.8 },
  { id: 'credit', name: 'Credit Spreads', exposureBaseM: 6.8, exposureShockM: 11.2, colorHex: 0xf43f5e, deltaPercent: 8.4 },
  { id: 'fx', name: 'FX Vol Skew', exposureBaseM: 3.2, exposureShockM: 5.6, colorHex: 0xf59e0b, deltaPercent: -0.5 },
  { id: 'comm', name: 'Commodity Basis', exposureBaseM: 1.9, exposureShockM: 2.9, colorHex: 0x10b981, deltaPercent: 4.1 },
  { id: 'net', name: 'Net Total VaR', exposureBaseM: 42.8, exposureShockM: 68.4, colorHex: 0xa855f7, deltaPercent: 5.8 },
];

export const ThreeWaterfall3D: React.FC<ThreeWaterfall3DProps> = ({
  height = 290,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSimulationMode } = useDashboard();
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [hoveredFactor, setHoveredFactor] = useState<ExposureFactorItem | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const barsRef = useRef<{ mesh: THREE.Mesh; item: ExposureFactorItem; targetHeight: number; currentHeight: number }[]>([]);
  const animFrameId = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const h = height;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 100);
    camera.position.set(0, 7, 16);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);

    const backLight = new THREE.PointLight(0xa855f7, 2, 20);
    backLight.position.set(-6, 4, -4);
    scene.add(backLight);

    // 5. Stage Platform & Floor Grid
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);
    groupRef.current = stageGroup;

    const floorGeom = new THREE.BoxGeometry(16, 0.3, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.position.y = -0.15;
    stageGroup.add(floorMesh);

    const floorEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(floorGeom),
      new THREE.LineBasicMaterial({ color: 0x38bdf8 })
    );
    floorEdges.position.y = -0.15;
    stageGroup.add(floorEdges);

    // 6. Waterfall Bars
    const barWidth = 1.3;
    const barDepth = 1.3;
    const spacing = 2.2;
    const startX = -((FACTORS.length - 1) * spacing) / 2;

    const bars: { mesh: THREE.Mesh; item: ExposureFactorItem; targetHeight: number; currentHeight: number }[] = [];

    FACTORS.forEach((factor, idx) => {
      const exp = isSimulationMode ? factor.exposureShockM : factor.exposureBaseM;
      const targetH = Math.max(0.8, (exp / 70) * 5.2);

      const geom = new THREE.BoxGeometry(barWidth, targetH, barDepth);
      const mat = new THREE.MeshStandardMaterial({
        color: factor.colorHex,
        emissive: factor.colorHex,
        emissiveIntensity: factor.id === 'net' ? 0.6 : 0.35,
        roughness: 0.2,
        metalness: 0.7,
        wireframe,
        transparent: true,
        opacity: 0.92
      });

      const mesh = new THREE.Mesh(geom, mat);
      const xPos = startX + idx * spacing;
      mesh.position.set(xPos, targetH / 2, 0);
      stageGroup.add(mesh);

      // Neon Top Cap
      const capGeom = new THREE.BoxGeometry(barWidth + 0.05, 0.08, barDepth + 0.05);
      const capMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
      const capMesh = new THREE.Mesh(capGeom, capMat);
      capMesh.position.y = targetH / 2 + 0.04;
      mesh.add(capMesh);

      // Base Neon Ring
      const ringGeom = new THREE.RingGeometry(0.8, 0.95, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: factor.colorHex, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(xPos, 0.01, 0);
      stageGroup.add(ringMesh);

      bars.push({ mesh, item: factor, targetHeight: targetH, currentHeight: targetH });
    });
    barsRef.current = bars;

    // 7. Raycasting
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(bars.map(b => b.mesh));

      if (intersects.length > 0) {
        const found = bars.find(b => b.mesh === intersects[0].object);
        if (found) {
          setHoveredFactor(found.item);
          return;
        }
      }
      setHoveredFactor(null);
    };
    renderer.domElement.addEventListener('mousemove', onPointerMove);

    // 8. Drag Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !stageGroup) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      stageGroup.rotation.y += dx * 0.008;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 9. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (autoRotate && !isDraggingRef.current && stageGroup) {
        stageGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.2;
      }

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    // 10. Resize
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
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      renderer.dispose();
    };
  }, [height, wireframe, autoRotate, isSimulationMode]);

  const zoomIn = () => {
    if (cameraRef.current) cameraRef.current.position.multiplyScalar(0.9);
  };
  const zoomOut = () => {
    if (cameraRef.current) cameraRef.current.position.multiplyScalar(1.1);
  };

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* 3D Viewport Controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-[#0B0E14]/85 backdrop-blur-md p-1 rounded-lg border border-[#273142]/80 text-[10px] font-mono shadow-lg">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={cn(
            "p-1.5 rounded transition-colors",
            autoRotate ? "text-cyan-400 bg-cyan-500/10" : "text-[#94A3B8] hover:text-[#F1F3F5]"
          )}
          title="Toggle Auto Spin"
        >
          <RotateCw size={12} className={autoRotate ? "animate-spin" : ""} />
        </button>
        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          className={cn(
            "p-1.5 rounded transition-colors",
            wireframe ? "text-cyan-400 bg-cyan-500/10" : "text-[#94A3B8] hover:text-[#F1F3F5]"
          )}
          title="Toggle Wireframe"
        >
          <Eye size={12} />
        </button>
        <button
          type="button"
          onClick={zoomIn}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#F1F3F5] transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={12} />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#F1F3F5] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={12} />
        </button>
      </div>

      {/* Floating Hover Card */}
      {hoveredFactor && (
        <div className="absolute top-2 left-2 z-20 bg-[#151B26]/95 backdrop-blur-md px-3 py-2 rounded-xl border border-cyan-500/40 shadow-2xl text-xs space-y-1 font-mono pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="font-bold text-[#F1F3F5]">{hoveredFactor.name}</div>
          <div className="text-cyan-400 font-bold">
            Exposure: ${isSimulationMode ? hoveredFactor.exposureShockM : hoveredFactor.exposureBaseM}M
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            Delta vs Baseline: <span className="text-[#51CF66]">+{hoveredFactor.deltaPercent}%</span>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="w-full cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden rounded-xl"
        style={{ height }}
      />

      {/* Factor labels below */}
      <div className="w-full grid grid-cols-6 gap-1 px-2 py-1.5 bg-[#0B0E14]/60 rounded-lg border border-[#273142]/50 text-[10px] font-mono mt-1 text-center">
        {FACTORS.map(f => (
          <div key={f.id} className="truncate">
            <span className="text-[#94A3B8] block truncate">{f.name}</span>
            <span className="font-bold text-[#F1F3F5]">
              ${isSimulationMode ? f.exposureShockM : f.exposureBaseM}M
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
