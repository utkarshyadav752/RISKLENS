import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../../context/DashboardContext';
import { RotateCw, ShieldCheck, ZoomIn, ZoomOut, Lock, Key } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ThreeComplianceVault3DProps {
  height?: number;
  className?: string;
}

export const ThreeComplianceVault3D: React.FC<ThreeComplianceVault3DProps> = ({
  height = 280,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { breaches, isSimulationMode } = useDashboard();
  const [autoRotate, setAutoRotate] = useState(true);

  const openBreaches = breaches.filter(b => b.status === 'open');
  const hasCritical = openBreaches.some(b => b.severity === 'critical');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vaultGroupRef = useRef<THREE.Group | null>(null);
  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);
  const animFrameId = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const h = height;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 2, 9);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const vaultLight = new THREE.PointLight(hasCritical ? 0xff4444 : 0x10b981, 3, 20);
    vaultLight.position.set(0, 0, 3);
    scene.add(vaultLight);

    // 5. Main Vault Group
    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);
    vaultGroupRef.current = vaultGroup;

    // Inner Cryptographic Core (Icosahedron)
    const coreGeom = new THREE.IcosahedronGeometry(1.6, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: hasCritical ? 0xff4444 : 0x10b981,
      emissive: hasCritical ? 0xcc1111 : 0x059669,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    vaultGroup.add(coreMesh);

    // Solid inner core cube
    const cubeGeom = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.9
    });
    const cubeMesh = new THREE.Mesh(cubeGeom, cubeMat);
    vaultGroup.add(cubeMesh);

    // Outer Gyroscope Shield Ring 1
    const ringGeom1 = new THREE.TorusGeometry(2.6, 0.08, 16, 64);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      metalness: 0.9,
      roughness: 0.1
    });
    const ring1 = new THREE.Mesh(ringGeom1, ringMat1);
    vaultGroup.add(ring1);
    ring1Ref.current = ring1;

    // Outer Gyroscope Shield Ring 2
    const ringGeom2 = new THREE.TorusGeometry(3.1, 0.08, 16, 64);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: hasCritical ? 0xff6b6b : 0x34d399,
      emissive: hasCritical ? 0xef4444 : 0x10b981,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1
    });
    const ring2 = new THREE.Mesh(ringGeom2, ringMat2);
    ring2.rotation.x = Math.PI / 2;
    vaultGroup.add(ring2);
    ring2Ref.current = ring2;

    // Orbiting Satellite Nodes (representing WORM ledger blocks)
    const blockCount = 8;
    const blockMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < blockCount; i++) {
      const bGeom = new THREE.BoxGeometry(0.35, 0.35, 0.35);
      const bMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        metalness: 0.8
      });
      const bMesh = new THREE.Mesh(bGeom, bMat);
      vaultGroup.add(bMesh);
      blockMeshes.push(bMesh);
    }

    // 6. Drag Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !vaultGroup) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      vaultGroup.rotation.y += dx * 0.008;
      vaultGroup.rotation.x += dy * 0.008;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 7. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();

      if (autoRotate && !isDraggingRef.current && vaultGroup) {
        vaultGroup.rotation.y += 0.006;
      }

      if (ring1Ref.current) {
        ring1Ref.current.rotation.x = t * 0.8;
        ring1Ref.current.rotation.y = t * 0.4;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.y = -t * 0.6;
        ring2Ref.current.rotation.z = t * 0.5;
      }

      // Orbit satellite blocks
      blockMeshes.forEach((mesh, idx) => {
        const angle = t * 0.7 + (idx / blockCount) * Math.PI * 2;
        const radius = 3.6;
        mesh.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 2) * 0.6,
          Math.sin(angle) * radius
        );
        mesh.rotation.x += 0.02;
        mesh.rotation.y += 0.03;
      });

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    // 8. Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = containerRef.current.clientWidth;
      cameraRef.current.aspect = newW / height;
      cameraRef.current.updateProjectionMatrix;
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
  }, [height, autoRotate, hasCritical, isSimulationMode]);

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-[#0B0E14]/85 backdrop-blur-md p-1 rounded-lg border border-[#273142]/80 text-[10px] font-mono shadow-lg">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={cn(
            "p-1.5 rounded transition-colors",
            autoRotate ? "text-emerald-400 bg-emerald-500/10" : "text-[#94A3B8] hover:text-[#F1F3F5]"
          )}
          title="Toggle Auto Spin"
        >
          <RotateCw size={12} className={autoRotate ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-[#0B0E14]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#273142]/80 text-[11px] font-mono shadow-lg">
        <Lock size={12} className={hasCritical ? "text-[#FF6B6B]" : "text-[#51CF66]"} />
        <span className="text-[#94A3B8]">WORM Vault:</span>
        <span className={hasCritical ? "text-[#FF6B6B] font-bold" : "text-[#51CF66] font-bold"}>
          {hasCritical ? 'SLA Alert Breach' : '100% Cryptographic Lock'}
        </span>
      </div>

      <div
        ref={containerRef}
        className="w-full cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden rounded-xl"
        style={{ height }}
      />

      <div className="w-full flex items-center justify-between px-3 py-1 bg-[#0B0E14]/60 rounded-lg border border-[#273142]/50 text-[10px] font-mono mt-1 text-[#94A3B8]">
        <span>SHA-256 Merkle Ring Verification Active</span>
        <span className="text-[#51CF66] font-semibold">SEC Rule 17a-4 Compliant</span>
      </div>
    </div>
  );
};
