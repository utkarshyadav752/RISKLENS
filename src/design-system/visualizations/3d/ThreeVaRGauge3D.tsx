import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../../context/DashboardContext';
import { RotateCw, ZoomIn, ZoomOut, Eye, Sparkles, ShieldAlert } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ThreeVaRGauge3DProps {
  currentValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  maxScale?: number;
  height?: number;
  className?: string;
}

export const ThreeVaRGauge3D: React.FC<ThreeVaRGauge3DProps> = ({
  currentValue: propCurrentValue,
  warningThreshold = 40.0,
  criticalThreshold = 50.0,
  maxScale = 80.0,
  height = 240,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSimulationMode, threatLevel } = useDashboard();
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  const value = propCurrentValue !== undefined
    ? propCurrentValue
    : isSimulationMode
    ? 68.4
    : 42.8;

  const pct = Math.min(Math.max(value / maxScale, 0), 1);
  const isCritical = value >= criticalThreshold;
  const isWarning = value >= warningThreshold && !isCritical;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const needleGroupRef = useRef<THREE.Group | null>(null);
  const outerRingRef = useRef<THREE.Mesh | null>(null);
  const sparkParticlesRef = useRef<THREE.Points | null>(null);
  const animFrameId = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 320;
    const h = height;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 100);
    camera.position.set(0, 1.5, 9.5);
    camera.lookAt(0, -0.2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(isCritical ? 0xff4444 : isWarning ? 0xffaa00 : 0x00d4ff, 3, 20);
    pointLight.position.set(0, 3, 5);
    scene.add(pointLight);

    const backLight = new THREE.DirectionalLight(0x3b82f6, 1.2);
    backLight.position.set(-5, 4, -5);
    scene.add(backLight);

    // 5. Gauge Base Group
    const gaugeGroup = new THREE.Group();
    scene.add(gaugeGroup);

    // Create 3 Segment Arcs: Safe, Warning, Critical
    const createArcSegment = (startAngle: number, endAngle: number, colorHex: number) => {
      const shape = new THREE.Shape();
      const innerR = 3.2;
      const outerR = 3.8;
      const segments = 32;

      // Outer arc
      for (let i = 0; i <= segments; i++) {
        const theta = startAngle + (endAngle - startAngle) * (i / segments);
        const x = Math.cos(theta) * outerR;
        const y = Math.sin(theta) * outerR;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      // Inner arc in reverse
      for (let i = segments; i >= 0; i--) {
        const theta = startAngle + (endAngle - startAngle) * (i / segments);
        const x = Math.cos(theta) * innerR;
        const y = Math.sin(theta) * innerR;
        shape.lineTo(x, y);
      }
      shape.closePath();

      const extrudeSettings = {
        steps: 1,
        depth: 0.35,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.05,
        bevelSegments: 3
      };
      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.8,
        wireframe
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.z = -0.175;
      return mesh;
    };

    // Semi-circle from Math.PI (left, 0) to 0 (right, max)
    const radSafeEnd = Math.PI - (warningThreshold / maxScale) * Math.PI;
    const radCritEnd = Math.PI - (criticalThreshold / maxScale) * Math.PI;

    const safeArc = createArcSegment(radSafeEnd, Math.PI, 0x51cf66); // Safe Green
    const warnArc = createArcSegment(radCritEnd, radSafeEnd, 0xfcc419); // Warning Amber
    const critArc = createArcSegment(0, radCritEnd, 0xff6b6b); // Critical Red
    gaugeGroup.add(safeArc, warnArc, critArc);

    // Glowing Gimbal Outer Ring
    const ringGeom = new THREE.TorusGeometry(4.2, 0.06, 16, 100, Math.PI);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const outerRing = new THREE.Mesh(ringGeom, ringMat);
    outerRing.rotation.z = 0;
    gaugeGroup.add(outerRing);
    outerRingRef.current = outerRing;

    // Dial Tick Marks
    const ticksCount = 17;
    for (let i = 0; i < ticksCount; i++) {
      const angle = Math.PI - (i / (ticksCount - 1)) * Math.PI;
      const isMajor = i % 4 === 0;
      const tickLength = isMajor ? 0.45 : 0.25;
      const r1 = 3.9;
      const r2 = r1 + tickLength;

      const p1 = new THREE.Vector3(Math.cos(angle) * r1, Math.sin(angle) * r1, 0.1);
      const p2 = new THREE.Vector3(Math.cos(angle) * r2, Math.sin(angle) * r2, 0.1);

      const tickGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const tickMat = new THREE.LineBasicMaterial({
        color: isMajor ? 0xf1f3f5 : 0x64748b,
        linewidth: isMajor ? 2 : 1
      });
      const tickLine = new THREE.Line(tickGeom, tickMat);
      gaugeGroup.add(tickLine);
    }

    // Dial Center Hub
    const hubGeom = new THREE.CylinderGeometry(0.7, 0.75, 0.5, 32);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2
    });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.rotation.x = Math.PI / 2;
    gaugeGroup.add(hub);

    // Center Core Gem
    const gemGeom = new THREE.SphereGeometry(0.35, 16, 16);
    const gemMat = new THREE.MeshStandardMaterial({
      color: isCritical ? 0xff4444 : isWarning ? 0xffaa00 : 0x38bdf8,
      emissive: isCritical ? 0xff2222 : isWarning ? 0xff8800 : 0x0284c7,
      emissiveIntensity: 1.2,
      roughness: 0.1
    });
    const gem = new THREE.Mesh(gemGeom, gemMat);
    gem.position.z = 0.35;
    gaugeGroup.add(gem);

    // 3D Pointer Needle Group
    const needleGroup = new THREE.Group();
    needleGroupRef.current = needleGroup;

    // Needle Blade (extending upwards from origin, length ~ 3.3)
    const bladeGeom = new THREE.ConeGeometry(0.18, 3.4, 6);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: isCritical ? 0xff4444 : 0x38bdf8,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.1
    });
    const bladeMesh = new THREE.Mesh(bladeGeom, bladeMat);
    bladeMesh.position.y = 1.7;
    needleGroup.add(bladeMesh);

    // Needle Counterweight
    const counterGeom = new THREE.CylinderGeometry(0.18, 0.22, 0.8, 16);
    const counterMesh = new THREE.Mesh(counterGeom, bladeMat);
    counterMesh.position.y = -0.4;
    needleGroup.add(counterMesh);

    gaugeGroup.add(needleGroup);

    // Position needle according to current value:
    // angle goes from +Math.PI/2 (left, 0) to -Math.PI/2 (right, max)
    const targetAngle = Math.PI / 2 - pct * Math.PI;
    needleGroup.rotation.z = targetAngle;

    // Spark Particles for Warning/Critical States
    const sparkCount = 80;
    const sparkPositions = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount * 3; i += 3) {
      sparkPositions[i] = (Math.random() - 0.5) * 6;
      sparkPositions[i + 1] = Math.random() * 4;
      sparkPositions[i + 2] = (Math.random() - 0.5) * 3;
    }
    const sparkGeom = new THREE.BufferGeometry();
    sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      size: 0.08,
      color: isCritical ? 0xff5555 : 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const sparkPoints = new THREE.Points(sparkGeom, sparkMat);
    gaugeGroup.add(sparkPoints);
    sparkParticlesRef.current = sparkPoints;

    // 6. Interactive Drag Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !gaugeGroup) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      gaugeGroup.rotation.y += dx * 0.008;
      gaugeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, gaugeGroup.rotation.x + dy * 0.008));
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
      const elapsedTime = clock.getElapsedTime();

      // Needle target interpolation
      if (needleGroupRef.current) {
        const needleTarget = Math.PI / 2 - pct * Math.PI;
        needleGroupRef.current.rotation.z += (needleTarget - needleGroupRef.current.rotation.z) * 0.08;
        // Subtle vibration if critical
        if (isCritical) {
          needleGroupRef.current.rotation.z += (Math.random() - 0.5) * 0.02;
        }
      }

      // Outer ring gentle breathing glow
      if (outerRingRef.current) {
        outerRingRef.current.rotation.z = Math.sin(elapsedTime * 0.8) * 0.05;
      }

      // Auto gentle hover rotation
      if (autoRotate && !isDraggingRef.current) {
        gaugeGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.18;
        gaugeGroup.rotation.x = 0.1 + Math.cos(elapsedTime * 0.7) * 0.06;
      }

      // Sparks animation
      if (sparkParticlesRef.current) {
        const positions = sparkParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < sparkPositions.length; i += 3) {
          positions[i] += 0.015;
          if (positions[i] > 4.5) positions[i] = 0.5;
        }
        sparkParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    // 8. Resize Handler
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
  }, [value, maxScale, warningThreshold, criticalThreshold, height, wireframe, autoRotate, isCritical, isWarning]);

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(6.0, cameraRef.current.position.z - 0.8);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(14.0, cameraRef.current.position.z + 0.8);
    }
  };

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* 3D Viewport Controls Overlay */}
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

      {/* Floating Risk Status Pill Top Left */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-[#0B0E14]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#273142]/80 text-[11px] font-mono shadow-lg">
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            isCritical
              ? "bg-[#FF6B6B] animate-ping"
              : isWarning
              ? "bg-[#FCC419] animate-pulse"
              : "bg-[#51CF66]"
          )}
        />
        <span className="text-[#94A3B8]">VaR:</span>
        <span
          className={cn(
            "font-bold",
            isCritical ? "text-[#FF6B6B]" : isWarning ? "text-[#FCC419]" : "text-[#51CF66]"
          )}
        >
          ${value.toFixed(1)}M
        </span>
      </div>

      {/* 3D Canvas Canvas Container */}
      <div
        ref={containerRef}
        className="w-full cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden rounded-xl"
        style={{ height }}
      />

      {/* Numerical Indicator & Thresholds Info Below */}
      <div className="w-full flex items-center justify-between px-3 py-1 bg-[#0B0E14]/60 rounded-lg border border-[#273142]/50 text-[11px] font-mono mt-1">
        <div className="flex items-center gap-1 text-[#51CF66]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#51CF66]" />
          <span>Safe &lt;${warningThreshold}M</span>
        </div>
        <div className="flex items-center gap-1 text-[#FCC419]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FCC419]" />
          <span>Warn &lt;${criticalThreshold}M</span>
        </div>
        <div className="flex items-center gap-1 text-[#FF6B6B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
          <span>Cap ${criticalThreshold}M</span>
        </div>
      </div>
    </div>
  );
};
