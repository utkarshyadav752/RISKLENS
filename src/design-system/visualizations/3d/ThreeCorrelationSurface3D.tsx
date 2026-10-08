import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../../context/DashboardContext';
import { RotateCw, Eye, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ThreeCorrelationSurface3DProps {
  height?: number;
  className?: string;
}

const ASSET_NAMES = ['Equities', 'FX (G10)', 'Rates', 'Commodities', 'Crypto'];

const CORR_MATRIX = [
  // Equities, FX, Rates, Commodities, Crypto
  [1.0, 0.42, -0.45, 0.38, 0.65],   // Equities
  [0.42, 1.0, -0.18, 0.52, 0.28],    // FX
  [-0.45, -0.18, 1.0, -0.32, -0.48], // Rates
  [0.38, 0.52, -0.32, 1.0, 0.22],    // Commodities
  [0.65, 0.28, -0.48, 0.22, 1.0],    // Crypto
];

export const ThreeCorrelationSurface3D: React.FC<ThreeCorrelationSurface3DProps> = ({
  height = 360,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSimulationMode } = useDashboard();
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<{ assetA: string; assetB: string; corr: number } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const surfaceMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameId = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 480;
    const h = height;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.025);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(12, 14, 16);
    camera.lookAt(0, 1.5, 0);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2.5, 30);
    purpleLight.position.set(-8, 6, -6);
    scene.add(purpleLight);

    // 5. Main Model Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    groupRef.current = rootGroup;

    // Platform Base
    const baseGeom = new THREE.CylinderGeometry(8.5, 9, 0.4, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8
    });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = -0.2;
    rootGroup.add(baseMesh);

    // Grid on base
    const gridHelper = new THREE.GridHelper(16, 16, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.02;
    rootGroup.add(gridHelper);

    // 6. 3D Correlation Surface Parametric Mesh
    const gridSegments = 32;
    const planeSize = 12;
    const planeGeom = new THREE.PlaneGeometry(planeSize, planeSize, gridSegments, gridSegments);
    planeGeom.rotateX(-Math.PI / 2);

    // Deform vertices based on bicubic interpolation of CORR_MATRIX
    const posAttr = planeGeom.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      // Map (x, z) in [-planeSize/2, planeSize/2] to matrix indices [0..4]
      const u = (x / planeSize + 0.5) * 4;
      const v = (z / planeSize + 0.5) * 4;

      const iu = Math.max(0, Math.min(3, Math.floor(u)));
      const iv = Math.max(0, Math.min(3, Math.floor(v)));
      const fu = u - iu;
      const fv = v - iv;

      // Bilinear interpolation of correlation values
      const c00 = CORR_MATRIX[iu][iv];
      const c10 = CORR_MATRIX[iu + 1][iv];
      const c01 = CORR_MATRIX[iu][iv + 1];
      const c11 = CORR_MATRIX[iu + 1][iv + 1];

      const corrVal =
        c00 * (1 - fu) * (1 - fv) +
        c10 * fu * (1 - fv) +
        c01 * (1 - fu) * fv +
        c11 * fu * fv;

      // Elevation: correlation from -1.0 (dip down) to +1.0 (mountain peak)
      const shockAmp = isSimulationMode ? 1.6 : 1.0;
      const heightVal = corrVal * 2.8 * shockAmp + 2.2;
      posAttr.setY(i, heightVal);

      // Vertex color: Red/Amber for high correlation, Cyan/Green for moderate, Blue/Purple for inverse
      if (corrVal > 0.5) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.35;
        colors[i * 3 + 2] = 0.35;
      } else if (corrVal > 0.1) {
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.9;
      } else if (corrVal > -0.2) {
        colors[i * 3] = 0.15;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.95;
      } else {
        colors[i * 3] = 0.75;
        colors[i * 3 + 1] = 0.25;
        colors[i * 3 + 2] = 0.95;
      }
    }

    planeGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    planeGeom.computeVertexNormals();

    const surfaceMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.25,
      metalness: 0.65,
      wireframe,
      transparent: true,
      opacity: 0.9
    });

    const surfaceMesh = new THREE.Mesh(planeGeom, surfaceMat);
    rootGroup.add(surfaceMesh);
    surfaceMeshRef.current = surfaceMesh;

    // Surface Wireframe Overlay
    const wireGeom = new THREE.WireframeGeometry(planeGeom);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25
    });
    const wireLines = new THREE.LineSegments(wireGeom, wireMat);
    surfaceMesh.add(wireLines);

    // 7. Asset Node Spheres positioned at key grid coordinates
    const nodeMeshes: { mesh: THREE.Mesh; assetIndex: number }[] = [];
    ASSET_NAMES.forEach((name, idx) => {
      const coord = (idx / 4 - 0.5) * planeSize;
      const nodeGeom = new THREE.SphereGeometry(0.35, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1
      });
      const node = new THREE.Mesh(nodeGeom, nodeMat);
      node.position.set(coord, 3.8, coord);
      rootGroup.add(node);

      // Outer ring around node
      const nodeRing = new THREE.Mesh(
        new THREE.RingGeometry(0.5, 0.65, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
      );
      nodeRing.rotation.x = Math.PI / 2;
      node.add(nodeRing);

      nodeMeshes.push({ mesh: node, assetIndex: idx });
    });

    // 8. Curved Laser Arcs connecting high correlation pairs
    const laserGroup = new THREE.Group();
    rootGroup.add(laserGroup);

    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        const corr = CORR_MATRIX[i][j];
        if (Math.abs(corr) > 0.35) {
          const xi = (i / 4 - 0.5) * planeSize;
          const xj = (j / 4 - 0.5) * planeSize;

          const p1 = new THREE.Vector3(xi, 3.8, xi);
          const p2 = new THREE.Vector3(xj, 3.8, xj);
          const mid = new THREE.Vector3((xi + xj) / 2, 4.8 + Math.abs(corr) * 1.5, (xi + xj) / 2);

          const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
          const pts = curve.getPoints(24);
          const curveGeom = new THREE.BufferGeometry().setFromPoints(pts);
          const curveMat = new THREE.LineBasicMaterial({
            color: corr > 0 ? 0x38bdf8 : 0xa855f7,
            transparent: true,
            opacity: 0.75
          });
          const arcLine = new THREE.Line(curveGeom, curveMat);
          laserGroup.add(arcLine);
        }
      }
    }

    // 9. Drag Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !rootGroup) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      rootGroup.rotation.y += dx * 0.007;
      rootGroup.rotation.x = Math.max(-0.4, Math.min(0.6, rootGroup.rotation.x + dy * 0.006));
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (autoRotate && !isDraggingRef.current && rootGroup) {
        rootGroup.rotation.y += 0.004;
      }

      // Subtle breathing wave ripple on surface vertices
      if (surfaceMeshRef.current) {
        const pos = surfaceMeshRef.current.geometry.attributes.position;
        for (let k = 0; k < pos.count; k++) {
          const origY = pos.getY(k);
          const ripple = Math.sin(elapsedTime * 2 + k * 0.1) * 0.02;
          pos.setY(k, origY + ripple);
        }
        pos.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    // 11. Resize
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

      {/* Surface Elevation Legend Badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-[#0B0E14]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#273142]/80 text-[10px] font-mono text-[#94A3B8]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-rose-500" />
          <span>High +ρ (&gt;+0.5)</span>
        </span>
        <span className="text-[#64748B]">·</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-cyan-400" />
          <span>Mild (~0.0)</span>
        </span>
        <span className="text-[#64748B]">·</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-purple-500" />
          <span>Inverse -ρ (&lt;-0.3)</span>
        </span>
      </div>

      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="w-full cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden rounded-xl"
        style={{ height }}
      />

      {/* Asset tags below */}
      <div className="w-full flex items-center justify-between px-3 py-1 bg-[#0B0E14]/60 rounded-lg border border-[#273142]/50 text-[10px] font-mono mt-1 text-[#94A3B8]">
        <span>5×5 Cross-Asset Topography Manifold · Geodesic Laser Couplings</span>
        <span className="text-cyan-400 font-semibold">Equities-Crypto ρ = +0.65 (Stressed)</span>
      </div>
    </div>
  );
};
