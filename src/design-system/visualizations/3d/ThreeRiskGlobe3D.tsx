import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../../context/DashboardContext';
import { RotateCw, Globe, ZoomIn, ZoomOut, Maximize2, ShieldCheck, MapPin } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface HubNode {
  name: string;
  lat: number;
  lng: number;
  exposureM: number;
  rating: string;
  status: 'safe' | 'warning' | 'critical';
  position?: THREE.Vector3;
}

const HUBS: HubNode[] = [
  { name: 'New York (US Primary)', lat: 40.71, lng: -74.00, exposureM: 184.5, rating: 'AA-', status: 'safe' },
  { name: 'London (UK / EMEA)', lat: 51.50, lng: -0.12, exposureM: 89.2, rating: 'A+', status: 'warning' },
  { name: 'Frankfurt (EU Settlement)', lat: 50.11, lng: 8.68, exposureM: 33.6, rating: 'AAA', status: 'safe' },
  { name: 'Tokyo (JP Asian Desk)', lat: 35.67, lng: 139.65, exposureM: 54.1, rating: 'AA', status: 'safe' },
  { name: 'Singapore (SG Liquidity)', lat: 1.35, lng: 103.82, exposureM: 38.3, rating: 'AAA', status: 'safe' },
  { name: 'Hong Kong (HK Derivatives)', lat: 22.31, lng: 114.16, exposureM: 42.0, rating: 'AA-', status: 'warning' },
  { name: 'Zurich (CH Custody)', lat: 47.37, lng: 8.54, exposureM: 26.4, rating: 'AAA', status: 'safe' },
  { name: 'São Paulo (LATAM Desk)', lat: -23.55, lng: -46.63, exposureM: 17.3, rating: 'BBB+', status: 'safe' }
];

const CONNECTIONS: [number, number][] = [
  [0, 1], // NY - London
  [1, 2], // London - Frankfurt
  [1, 6], // London - Zurich
  [0, 7], // NY - São Paulo
  [1, 3], // London - Tokyo
  [3, 4], // Tokyo - Singapore
  [3, 5], // Tokyo - HK
  [4, 0]  // Singapore - NY
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

interface ThreeRiskGlobe3DProps {
  className?: string;
  height?: number;
}

export const ThreeRiskGlobe3D: React.FC<ThreeRiskGlobe3DProps> = ({
  className,
  height = 360
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSimulationMode } = useDashboard();
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedHub, setSelectedHub] = useState<HubNode>(HUBS[0]);
  const [hoveredHub, setHoveredHub] = useState<HubNode | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
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

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 5, 22);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Globe Master Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const globeRadius = 7.5;

    // 4. Base Core Sphere with Dark Obsidian Hologram
    const coreGeom = new THREE.SphereGeometry(globeRadius, 48, 48);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });
    const coreSphere = new THREE.Mesh(coreGeom, coreMat);
    globeGroup.add(coreSphere);

    // 5. Wireframe Latitude/Longitude Grid Shell
    const wireGeom = new THREE.SphereGeometry(globeRadius + 0.05, 32, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x273142,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireSphere = new THREE.Mesh(wireGeom, wireMat);
    globeGroup.add(wireSphere);

    // 6. Glowing Outer Atmosphere Halo
    const haloGeom = new THREE.SphereGeometry(globeRadius + 0.8, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const haloSphere = new THREE.Mesh(haloGeom, haloMat);
    globeGroup.add(haloSphere);

    // 7. Counterparty Hub Markers & Pulsing Rings
    const hubMarkers: THREE.Mesh[] = [];
    HUBS.forEach((hub) => {
      const pos = latLngToVector3(hub.lat, hub.lng, globeRadius + 0.12);
      hub.position = pos;

      // Center Node
      const nodeGeom = new THREE.SphereGeometry(0.22, 16, 16);
      const nodeColor = hub.status === 'warning' ? 0xff922b : 0x51cf66;
      const nodeMat = new THREE.MeshBasicMaterial({ color: nodeColor });
      const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
      nodeMesh.position.copy(pos);
      nodeMesh.userData = { hub };
      globeGroup.add(nodeMesh);
      hubMarkers.push(nodeMesh);

      // Beacon Outer Ring
      const ringGeom = new THREE.RingGeometry(0.3, 0.45, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      globeGroup.add(ringMesh);
    });

    // 8. 3D Geodesic Spline Arcs & Animated Transaction Photons
    const photonParticles: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; speed: number; progress: number }[] = [];

    CONNECTIONS.forEach(([i, j]) => {
      const p1 = HUBS[i].position!;
      const p2 = HUBS[j].position!;

      // Arc midpoint pushed outward into space
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const midDistance = mid.length();
      mid.normalize().multiplyScalar(midDistance + 2.8);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(36);
      const curveGeom = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.45
      });
      const curveLine = new THREE.Line(curveGeom, curveMat);
      globeGroup.add(curveLine);

      // Photon packet moving along curve
      const photonGeom = new THREE.SphereGeometry(0.12, 8, 8);
      const photonMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
      const photon = new THREE.Mesh(photonGeom, photonMat);
      globeGroup.add(photon);

      photonParticles.push({
        mesh: photon,
        curve,
        speed: 0.006 + Math.random() * 0.004,
        progress: Math.random()
      });
    });

    // 9. Floating Orbital Satellites / Background Constellation Stars
    const starsGeom = new THREE.BufferGeometry();
    const starCount = 200;
    const starPos = new Float32Array(starCount * 3);
    for (let k = 0; k < starCount * 3; k += 3) {
      starPos[k] = (Math.random() - 0.5) * 60;
      starPos[k + 1] = (Math.random() - 0.5) * 60;
      starPos[k + 2] = (Math.random() - 0.5) * 60;
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x64748b, size: 0.35, transparent: true, opacity: 0.6 });
    const starField = new THREE.Points(starsGeom, starsMat);
    scene.add(starField);

    // 10. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (autoRotate && !isDraggingRef.current && globeGroupRef.current) {
        globeGroupRef.current.rotation.y += 0.003;
      }

      // Animate flowing transaction photons
      photonParticles.forEach(p => {
        p.progress = (p.progress + p.speed) % 1;
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      });

      // Pulse hub markers
      hubMarkers.forEach((m, idx) => {
        const scale = 1 + Math.sin(elapsed * 4 + idx) * 0.15;
        m.scale.setScalar(scale);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 11. Mouse / Pointer Drag Handlers
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Raycasting for node hover
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(hubMarkers);

      if (intersects.length > 0) {
        const hub = intersects[0].object.userData.hub as HubNode;
        setHoveredHub(hub);
      } else {
        setHoveredHub(null);
      }

      if (!isDraggingRef.current || !globeGroupRef.current) return;

      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.006;
      globeGroupRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroupRef.current.rotation.x + deltaY * 0.004));

      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(hubMarkers);
      if (intersects.length > 0) {
        const hub = intersects[0].object.userData.hub as HubNode;
        setSelectedHub(hub);
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 12. Resize
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
      coreGeom.dispose();
      coreMat.dispose();
    };
  }, [height]);

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(14, Math.min(32, cameraRef.current.position.z + delta));
    }
  };

  const activeHubDisplay = hoveredHub || selectedHub;

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
          <Globe size={14} className="text-blue-400" />
          <span className="font-mono text-xs font-bold tracking-wider text-[#F1F3F5] uppercase">
            3D Global Counterparty Grid
          </span>
        </div>
        <p className="text-[11px] font-mono text-[#94A3B8]">
          Cross-Border Settlement Liquidity &amp; Geodesic Flow Arcs
        </p>
      </div>

      {/* Selected Node Telemetry Card */}
      {activeHubDisplay && (
        <div className="absolute bottom-3 left-3 bg-[#151B26]/85 backdrop-blur-md border border-[#273142] p-3 rounded-lg font-mono text-xs shadow-2xl flex flex-col gap-1.5 min-w-[220px]">
          <div className="flex items-center justify-between pb-1 border-b border-[#273142]/60">
            <span className="font-bold text-[#F1F3F5] flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-400" />
              {activeHubDisplay.name}
            </span>
            <span className={cn(
              'px-1.5 py-0.2 rounded text-[10px] font-bold border uppercase',
              activeHubDisplay.status === 'warning' ? 'bg-[#FF922B]/20 text-[#FF922B] border-[#FF922B]/40' : 'bg-[#51CF66]/20 text-[#51CF66] border-[#51CF66]/40'
            )}>
              {activeHubDisplay.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#64748B]">Active Exposure:</span>
            <span className="font-bold text-[#F1F3F5]">${activeHubDisplay.exposureM}M</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#64748B]">Credit Rating:</span>
            <span className="font-semibold text-[#51CF66]">{activeHubDisplay.rating}</span>
          </div>
        </div>
      )}

      {/* Controls Dock */}
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
