import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../../context/DashboardContext';
import type { BreachAlert } from '../../../types/risk';
import { RotateCw, ZoomIn, ZoomOut, ShieldAlert, CheckCircle2, Clock, Eye, AlertOctagon } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ThreeAlertCommandCenter3DProps {
  onSelectBreach?: (breach: BreachAlert) => void;
  selectedBreachId?: string;
  className?: string;
}

export const ThreeAlertCommandCenter3D: React.FC<ThreeAlertCommandCenter3DProps> = ({
  onSelectBreach,
  selectedBreachId,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { breaches, threatLevel, acknowledgeBreach } = useDashboard();
  const [hoveredBreach, setHoveredBreach] = useState<BreachAlert | null>(null);
  const [activeBreach, setActiveBreach] = useState<BreachAlert | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodesGroupRef = useRef<THREE.Group | null>(null);
  const radarSweepRef = useRef<THREE.Mesh | null>(null);

  const activeBreaches = breaches.filter(b => b.status === 'open' || b.status === 'acknowledged');

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = 340;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.02);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const alertColor = threatLevel === 'crisis' ? 0xff2222 : 0x0ea5e9;
    const centerLight = new THREE.PointLight(alertColor, 3, 40);
    centerLight.position.set(0, 2, 0);
    scene.add(centerLight);

    // 5. Tactical Holographic Radar Floor
    const radarGroup = new THREE.Group();
    scene.add(radarGroup);

    // Concentric Range Rings
    [6, 12, 18, 24].forEach((radius, idx) => {
      const ringGeom = new THREE.RingGeometry(radius - 0.06, radius + 0.06, 64);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 3 ? 0xef4444 : 0x38bdf8,
        transparent: true,
        opacity: idx === 3 ? 0.45 : 0.25,
        side: THREE.DoubleSide
      });
      radarGroup.add(new THREE.Mesh(ringGeom, ringMat));
    });

    // Crosshairs
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2 });
    const crossPoints1 = [new THREE.Vector3(-25, 0, 0), new THREE.Vector3(25, 0, 0)];
    const crossLine1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(crossPoints1), lineMat);
    radarGroup.add(crossLine1);

    const crossPoints2 = [new THREE.Vector3(0, 0, -25), new THREE.Vector3(0, 0, 25)];
    const crossLine2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(crossPoints2), lineMat);
    radarGroup.add(crossLine2);

    // Radar Scanning Fan Sweep
    const sweepGeom = new THREE.CircleGeometry(24, 32, 0, Math.PI / 4);
    sweepGeom.rotateX(-Math.PI / 2);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const radarSweep = new THREE.Mesh(sweepGeom, sweepMat);
    radarGroup.add(radarSweep);
    radarSweepRef.current = radarSweep;

    // 6. Central Hazard Core (Tactical Hologram Core)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreMeshGeom = new THREE.DodecahedronGeometry(2.0, 0);
    const coreMeshMat = new THREE.MeshPhongMaterial({
      color: threatLevel === 'crisis' ? 0xef4444 : 0x0284c7,
      emissive: threatLevel === 'crisis' ? 0x991b1b : 0x0369a1,
      emissiveIntensity: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const coreMesh = new THREE.Mesh(coreMeshGeom, coreMeshMat);
    coreGroup.add(coreMesh);

    // Orbiting core gyroscopes
    const gyroGeom = new THREE.TorusGeometry(3.0, 0.06, 8, 36);
    const gyroMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6
    });
    const gyro1 = new THREE.Mesh(gyroGeom, gyroMat);
    gyro1.rotation.x = Math.PI / 4;
    coreGroup.add(gyro1);

    const gyro2 = new THREE.Mesh(gyroGeom, gyroMat);
    gyro2.rotation.y = Math.PI / 3;
    coreGroup.add(gyro2);

    // 7. Interactive Breach Satellites
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);
    nodesGroupRef.current = nodesGroup;

    const interactiveMeshes: THREE.Mesh[] = [];

    // Map each active breach to a 3D coordinate around the tactical core
    activeBreaches.forEach((breach, idx) => {
      const angle = (idx / Math.max(activeBreaches.length, 1)) * Math.PI * 2;
      const dist = breach.severity === 'critical' ? 14 : breach.severity === 'high' ? 18 : 22;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = (Math.sin(idx * 2) * 3) + 2;

      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(x, y, z);
      nodeGroup.userData = { breach };

      const bColor =
        breach.severity === 'critical'
          ? 0xff3b3b
          : breach.severity === 'high'
          ? 0xff922b
          : breach.severity === 'medium'
          ? 0xfcc419
          : 0x51cf66;

      // Outer glowing beacon
      const beaconGeom = new THREE.IcosahedronGeometry(breach.severity === 'critical' ? 1.4 : 1.1, 0);
      const beaconMat = new THREE.MeshPhongMaterial({
        color: bColor,
        emissive: bColor,
        emissiveIntensity: 0.7,
        wireframe: false,
        transparent: true,
        opacity: 0.85
      });
      const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
      beaconMesh.userData = { breach };
      nodeGroup.add(beaconMesh);
      interactiveMeshes.push(beaconMesh);

      // Warning aura cage
      const auraGeom = new THREE.IcosahedronGeometry(breach.severity === 'critical' ? 1.8 : 1.4, 0);
      const auraMat = new THREE.MeshBasicMaterial({
        color: bColor,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      const auraMesh = new THREE.Mesh(auraGeom, auraMat);
      nodeGroup.add(auraMesh);

      // Laser Tether from Central Reactor to Satellite
      const tetherPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)];
      const tetherGeom = new THREE.BufferGeometry().setFromPoints(tetherPoints);
      const tetherMat = new THREE.LineBasicMaterial({
        color: bColor,
        transparent: true,
        opacity: breach.severity === 'critical' ? 0.6 : 0.3
      });
      const tetherLine = new THREE.Line(tetherGeom, tetherMat);
      nodesGroup.add(tetherLine);

      // Elevation Dropdown line to radar grid
      const dropPoints = [new THREE.Vector3(x, y, z), new THREE.Vector3(x, 0, z)];
      const dropGeom = new THREE.BufferGeometry().setFromPoints(dropPoints);
      const dropMat = new THREE.LineDashedMaterial({
        color: 0x64748b,
        dashSize: 0.5,
        gapSize: 0.5,
        transparent: true,
        opacity: 0.4
      });
      const dropLine = new THREE.Line(dropGeom, dropMat);
      dropLine.computeLineDistances();
      nodesGroup.add(dropLine);

      // Target footprint on the radar floor
      const footGeom = new THREE.RingGeometry(0.5, 0.8, 16);
      footGeom.rotateX(-Math.PI / 2);
      const footMat = new THREE.MeshBasicMaterial({
        color: bColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const footMesh = new THREE.Mesh(footGeom, footMat);
      footMesh.position.set(x, 0.05, z);
      nodesGroup.add(footMesh);

      nodesGroup.add(nodeGroup);
    });

    // 8. Raycaster Interaction (Mouse Hover / Click)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const b = hit.userData.breach as BreachAlert;
        if (b) {
          setHoveredBreach(b);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredBreach(null);
        container.style.cursor = 'default';
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const b = hit.userData.breach as BreachAlert;
        if (b) {
          setActiveBreach(b);
          if (onSelectBreach) onSelectBreach(b);
        }
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Rotate radar sweep
      if (radarSweepRef.current) {
        radarSweepRef.current.rotation.y = elapsed * 1.5;
      }

      // Rotate core
      coreMesh.rotation.y = elapsed * 0.8;
      coreMesh.rotation.x = elapsed * 0.4;
      gyro1.rotation.z = elapsed * 1.2;
      gyro2.rotation.x = -elapsed * 0.9;

      // Pulse core in crisis
      if (threatLevel === 'crisis') {
        const pulse = 1 + Math.sin(elapsed * 4) * 0.15;
        coreMesh.scale.set(pulse, pulse, pulse);
      }

      // Rotate whole satellite galaxy slowly if autoRotate
      if (autoRotate && nodesGroupRef.current) {
        nodesGroupRef.current.rotation.y = elapsed * 0.08;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    // 10. Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || 600;
      cameraRef.current.aspect = w / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, [activeBreaches.length, threatLevel, autoRotate]);

  // Handle camera zoom
  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(12, Math.min(45, cameraRef.current.position.z + delta));
  };

  const handleResetCamera = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(0, 18, 28);
    cameraRef.current.lookAt(0, 0, 0);
  };

  const selectedOrHovered = hoveredBreach || activeBreach;

  return (
    <div className={cn('relative rounded-xl border border-[#273142] bg-[#0B0E14] overflow-hidden', className)}>
      {/* 3D Viewport Controls & HUD Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-[#151B26]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#273142]/80 pointer-events-auto">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#F1F3F5]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span>3D ALERT COMMAND TOPOLOGY</span>
          </div>
          <span className="text-[#64748B] text-xs">|</span>
          <span className="font-mono text-[11px] text-[#94A3B8]">
            {activeBreaches.length} Active Spatial Breach Satellites
          </span>
        </div>

        {/* Camera action buttons */}
        <div className="flex items-center gap-1.5 bg-[#151B26]/90 backdrop-blur-md p-1 rounded-lg border border-[#273142]/80 pointer-events-auto">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={cn(
              'p-1.5 rounded text-xs transition-colors',
              autoRotate ? 'text-blue-400 bg-blue-500/20' : 'text-[#64748B] hover:text-[#F1F3F5]'
            )}
            title="Toggle Orbital Auto-Rotation"
          >
            <RotateCw size={13} className={autoRotate ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-4)}
            className="p-1.5 rounded text-[#64748B] hover:text-[#F1F3F5] transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(4)}
            className="p-1.5 rounded text-[#64748B] hover:text-[#F1F3F5] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            type="button"
            onClick={handleResetCamera}
            className="p-1.5 rounded text-[#64748B] hover:text-[#F1F3F5] transition-colors"
            title="Reset Tactical Camera"
          >
            <Eye size={13} />
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="w-full h-[340px] cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Node Target HUD Overlay */}
      {selectedOrHovered && (
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-[#151B26]/95 backdrop-blur-md border border-[#3B82F6]/50 p-3 rounded-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2 rounded-lg shrink-0 mt-0.5',
                selectedOrHovered.severity === 'critical'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : selectedOrHovered.severity === 'high'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              )}
            >
              <AlertOctagon size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[#38BDF8] font-semibold">
                  {selectedOrHovered.desk}
                </span>
                <span className="text-[#64748B]">·</span>
                <span className="font-mono text-[10px] text-[#94A3B8]">
                  ID: {selectedOrHovered.id}
                </span>
                <span
                  className={cn(
                    'text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-bold',
                    selectedOrHovered.severity === 'critical'
                      ? 'bg-red-950 text-red-300 border border-red-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  )}
                >
                  {selectedOrHovered.severity}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-[#F1F3F5] mt-0.5">
                {selectedOrHovered.title}
              </h4>
              <p className="font-mono text-[11px] text-[#94A3B8] mt-0.5">
                Observed: <span className="text-[#FF6B6B] font-bold">{selectedOrHovered.currentValue} {selectedOrHovered.unit}</span> vs Limit: <span className="text-emerald-400 font-semibold">{selectedOrHovered.thresholdValue} {selectedOrHovered.unit}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                acknowledgeBreach(selectedOrHovered.id, 'Triaged via 3D Holographic Command Center');
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-mono transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
            >
              <CheckCircle2 size={13} />
              <span>Acknowledge in 3D</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
