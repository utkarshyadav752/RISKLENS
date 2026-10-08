import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../../context/DashboardContext';
import { RotateCw, Eye, Sparkles, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ThreeRiskTerrain3DProps {
  className?: string;
  height?: number;
}

export const ThreeRiskTerrain3D: React.FC<ThreeRiskTerrain3DProps> = ({
  className,
  height = 340
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSimulationMode, threatLevel } = useDashboard();
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredCoords, setHoveredCoords] = useState<{ strike: string; expiry: string; iv: string } | null>(null);

  // References to keep across re-renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const h = height;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.035);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 14, 18);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x60a5fa, 1.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const redLight = new THREE.DirectionalLight(0xff6b6b, 1.2);
    redLight.position.set(-10, 15, -10);
    scene.add(redLight);

    // 5. Geometry generation for 3D Volatility & Loss Surface
    const size = 16;
    const segments = 44;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const updateSurface = (time: number) => {
      const isStressed = isSimulationMode || threatLevel === 'crisis';
      const amp = isStressed ? 2.4 : 1.2;
      const freq = isStressed ? 0.45 : 0.25;

      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getZ(i);

        // Volatility smile & tail risk dislocation formula
        const distFromCenter = Math.sqrt(u * u + v * v);
        const wave1 = Math.sin(u * freq + time * 1.5) * Math.cos(v * freq + time * 1.2);
        const skew = (u / 8) * (v / 8); // Skew term
        const tailDrift = isStressed ? Math.exp(Math.max(0, -u - 2) * 0.45) * 1.5 : 0;
        const elevation = (wave1 + skew) * amp + tailDrift - (distFromCenter * 0.08);

        pos.setY(i, elevation);

        // Color gradient: Emerald (safe bottom) -> Amber (mid) -> Red (high tail peaks)
        const normY = (elevation + 2) / (amp * 3.2 + 2);
        if (normY > 0.65) {
          // Critical Red/Pink
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 0.25 + (1 - normY) * 0.4;
          colors[i * 3 + 2] = 0.25;
        } else if (normY > 0.4) {
          // Warning Orange/Amber
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 0.65;
          colors[i * 3 + 2] = 0.15;
        } else {
          // Nominal Cyan/Emerald
          colors[i * 3] = 0.2;
          colors[i * 3 + 1] = 0.75 + normY * 0.2;
          colors[i * 3 + 2] = 0.5 + (1 - normY) * 0.4;
        }
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    };

    updateSurface(0);

    // 6. Material & Mesh
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.2,
      wireframe: false,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // 7. Wireframe Overlay
    const wireframeGeom = new THREE.WireframeGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.35 });
    const wireframeMesh = new THREE.LineSegments(wireframeGeom, wireframeMat);
    wireframeMesh.position.y = 0.02;
    wireframeMesh.visible = wireframe;
    mesh.add(wireframeMesh);
    wireframeMeshRef.current = wireframeMesh;

    // 8. Grid base platform with glowing border
    const gridHelper = new THREE.GridHelper(size, 16, 0x3b82f6, 0x1f2736);
    gridHelper.position.y = -2.5;
    scene.add(gridHelper);

    // 9. Interactive Ring Marker for Extreme VaR Cutoff
    const ringGeom = new THREE.RingGeometry(3.5, 3.7, 32);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff6b6b, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const cutoffRing = new THREE.Mesh(ringGeom, ringMat);
    cutoffRing.position.set(-3.5, 0.2, 2.5);
    scene.add(cutoffRing);

    // 10. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      updateSurface(elapsedTime);

      if (autoRotate && !isDraggingRef.current && meshRef.current) {
        meshRef.current.rotation.y += 0.0035;
      }

      // Cutoff ring breathing pulse
      if (cutoffRing) {
        cutoffRing.scale.setScalar(1 + Math.sin(elapsedTime * 3) * 0.05);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Mouse / Pointer Drag Handlers for 3D Camera Orbit
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !meshRef.current) {
        // Track mock coordinates on hover
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const strike = (90 + (x * 0.3)).toFixed(1);
        const expiry = (10 + (y * 0.8)).toFixed(0);
        const iv = (18.2 + Math.abs(x - 50) * 0.45).toFixed(1);
        setHoveredCoords({ strike: `$${strike}`, expiry: `${expiry}D`, iv: `${iv}%` });
        return;
      }
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      meshRef.current.rotation.y += deltaX * 0.008;
      meshRef.current.rotation.x = Math.max(-0.4, Math.min(0.8, meshRef.current.rotation.x + deltaY * 0.005));

      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 12. Resize Observer
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
      geometry.dispose();
      material.dispose();
    };
  }, [height, isSimulationMode, threatLevel]);

  // Sync wireframe toggle
  useEffect(() => {
    if (wireframeMeshRef.current) {
      wireframeMeshRef.current.visible = wireframe;
    }
    if (meshRef.current && meshRef.current.material) {
      (meshRef.current.material as THREE.MeshStandardMaterial).wireframe = wireframe;
    }
  }, [wireframe]);

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(10, Math.min(30, cameraRef.current.position.z + delta));
    }
  };

  const resetView = () => {
    if (meshRef.current && cameraRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(0, 14, 18);
    }
  };

  return (
    <div className={cn('relative w-full rounded-xl overflow-hidden bg-[#0B0E14] border border-[#273142]', className)}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full cursor-grab active:cursor-grabbing select-none"
        style={{ height }}
      />

      {/* Floating 3D Telemetry HUD Overlay */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#51CF66] animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-wider text-[#F1F3F5] uppercase">
            3D Parametric Risk Terrain
          </span>
          {isSimulationMode && (
            <span className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-400 font-mono text-[10px] font-bold animate-pulse">
              STRESS SHOCK ACTIVE
            </span>
          )}
        </div>
        <p className="text-[11px] font-mono text-[#94A3B8]">
          Z-Axis = Tail Loss Sensitivity · Strike (X) × Term Expiry (Y)
        </p>
      </div>

      {/* Hover Coordinate Inspector Box */}
      {hoveredCoords && (
        <div className="absolute bottom-3 left-3 bg-[#151B26]/85 backdrop-blur-md border border-[#273142] px-3 py-1.5 rounded-lg font-mono text-[11px] flex items-center gap-3 pointer-events-none shadow-xl">
          <span className="text-[#64748B]">Strike: <b className="text-[#F1F3F5]">{hoveredCoords.strike}</b></span>
          <span className="text-[#64748B]">Tenor: <b className="text-[#F1F3F5]">{hoveredCoords.expiry}</b></span>
          <span className="text-[#64748B]">ImpVol: <b className="text-[#FF922B]">{hoveredCoords.iv}</b></span>
        </div>
      )}

      {/* Interactive 3D Camera Controls Floating Dock */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#151B26]/85 backdrop-blur-md p-1 rounded-lg border border-[#273142] shadow-xl">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={cn(
            'p-1.5 rounded text-xs transition-colors',
            autoRotate ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'text-[#94A3B8] hover:text-[#F1F3F5]'
          )}
          title="Toggle Auto-Rotation"
          aria-label="Toggle Auto-Rotation"
        >
          <RotateCw size={13} className={autoRotate ? 'animate-spin' : ''} />
        </button>

        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          className={cn(
            'p-1.5 rounded text-xs transition-colors',
            wireframe ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'text-[#94A3B8] hover:text-[#F1F3F5]'
          )}
          title="Toggle 3D Wireframe Grid"
          aria-label="Toggle 3D Wireframe Grid"
        >
          <Eye size={13} />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(-2)}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#F1F3F5] transition-colors"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={13} />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(2)}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#F1F3F5] transition-colors"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>

        <button
          type="button"
          onClick={resetView}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#F1F3F5] transition-colors"
          title="Reset Camera Orientation"
          aria-label="Reset Camera"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Legend at bottom right */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-[#151B26]/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#273142] font-mono text-[10px] pointer-events-none">
        <span className="flex items-center gap-1 text-[#51CF66]"><span className="w-1.5 h-1.5 rounded-full bg-[#51CF66]" />Safe</span>
        <span className="flex items-center gap-1 text-[#FCC419]"><span className="w-1.5 h-1.5 rounded-full bg-[#FCC419]" />Warn</span>
        <span className="flex items-center gap-1 text-[#FF6B6B]"><span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />VaR Tail</span>
      </div>
    </div>
  );
};
