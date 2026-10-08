import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDashboard } from '../../../context/DashboardContext';
import { RotateCw, Eye, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ThreeRiskHeatmap3DProps {
  height?: number;
  className?: string;
}

interface CellInfo {
  row: number; // 0: Negligible, 1: Moderate, 2: Major, 3: Catastrophic
  col: number; // 0: Low, 1: Medium, 2: High, 3: Extreme
  count: number;
  assets: string[];
  severity: 'safe' | 'medium' | 'high' | 'critical';
  impactLabel: string;
  likelihoodLabel: string;
}

const HEATMAP_CELLS: CellInfo[] = [
  // Row 3: Catastrophic
  { row: 3, col: 0, count: 1, assets: ['Sovereign Debt Default EUR'], severity: 'medium', impactLabel: 'Catastrophic', likelihoodLabel: 'Low' },
  { row: 3, col: 1, count: 2, assets: ['G10 FX Liquidity Freeze', 'US Tech Flash Crash'], severity: 'high', impactLabel: 'Catastrophic', likelihoodLabel: 'Medium' },
  { row: 3, col: 2, count: 4, assets: ['Prime Broker Margin Call', 'Tier-1 Clearing House Failure', 'Crude Oil $150 Spike', 'Treasury Auction Tail'], severity: 'critical', impactLabel: 'Catastrophic', likelihoodLabel: 'High' },
  { row: 3, col: 3, count: 2, assets: ['Global Cyber Grid Outage', 'Systemic Settlement Failure'], severity: 'critical', impactLabel: 'Catastrophic', likelihoodLabel: 'Extreme' },

  // Row 2: Major
  { row: 2, col: 0, count: 3, assets: ['UK Gilt Yield Dislocation', 'Corporate Credit Downgrade', 'Shipping Canal Blockage'], severity: 'safe', impactLabel: 'Major', likelihoodLabel: 'Low' },
  { row: 2, col: 1, count: 5, assets: ['Crypto Derivatives De-peg', 'EM Currency Devaluation', 'Repo Spike > 100bps', 'Semi Chip Supply Ban', 'Options Gamma Imbalance'], severity: 'medium', impactLabel: 'Major', likelihoodLabel: 'Medium' },
  { row: 2, col: 2, count: 6, assets: ['High Yield Spread Widening', 'Algorithmic Execution Loop', 'Hedge Fund Run on Collateral', 'Exchange API Gateway Latency', 'Convertible Arbitrage Unwind', 'Index Rebalance Slippage'], severity: 'high', impactLabel: 'Major', likelihoodLabel: 'High' },
  { row: 2, col: 3, count: 3, assets: ['Cross-Currency Basis Dislocation', 'LMM Rate Model Failure', 'Synthetic CDO Spread Inversion'], severity: 'critical', impactLabel: 'Major', likelihoodLabel: 'Extreme' },

  // Row 1: Moderate
  { row: 1, col: 0, count: 8, assets: ['Municipal Bond Delays', 'Dividend Cut', 'Small-cap Momentum Reversal', 'FX Carry Unwind', 'Agency MBS Prepay Spike', 'Gold Basis Dislocation', 'Natural Gas Volatility', 'Carbon Credit Gap'], severity: 'safe', impactLabel: 'Moderate', likelihoodLabel: 'Low' },
  { row: 1, col: 1, count: 7, assets: ['Earnings Guidance Miss', 'Sector Rotation Tech->Value', 'VIX Future Roll Yield Loss', 'Dark Pool Fill Degradation', 'Credit Card ABS Delinquency', 'Short Squeeze Meme Risk', 'Bank Run Rumor'], severity: 'safe', impactLabel: 'Moderate', likelihoodLabel: 'Medium' },
  { row: 1, col: 2, count: 4, assets: ['Single-Stock HFT Quoting Lag', 'ETD Futures Margining Jump', 'SOFR-OIS Curve Inversion', 'Bond ETF Discount to NAV'], severity: 'medium', impactLabel: 'Moderate', likelihoodLabel: 'High' },
  { row: 1, col: 3, count: 2, assets: ['Intraday Position Limit Near-Breach', 'Settlement Messaging Desync'], severity: 'high', impactLabel: 'Moderate', likelihoodLabel: 'Extreme' },

  // Row 0: Negligible
  { row: 0, col: 0, count: 12, assets: ['Overnight Cash Drift', 'Odd-lot Bond Spread', 'FX Tick Noise', 'Custody Reconciliation Tick', 'Exchange Fee Adjustment', 'Index Weight Fluctuation', 'Micro-Cap Quote Spread', 'Penny Pilot Friction', 'Proxy Voting Quorum', 'ADR Conversion Fee', 'Repo 1bp Noise', 'FX Spot Spread 0.2bp'], severity: 'safe', impactLabel: 'Negligible', likelihoodLabel: 'Low' },
  { row: 0, col: 1, count: 9, assets: ['Trade Blotter Timestamp Skew', 'Clearing House Margin Holiday', 'Brokerage Commission Rebate', 'Order Routing Micro-Delay', 'Market Data Feed Spike', 'Option Expiry Pinning', 'Dividends Withholding Drift', 'FX Fixing Gap', 'Securities Lending Recall'], severity: 'safe', impactLabel: 'Negligible', likelihoodLabel: 'Medium' },
  { row: 0, col: 2, count: 5, assets: ['Floor Broker Reject Rate', 'Limit Order Book Cancellation Spike', 'Odd-Lot Treasury Fill Delay', 'ADR Dividend Tax Withholding', 'Retail Sentiment Shift'], severity: 'safe', impactLabel: 'Moderate', likelihoodLabel: 'High' },
  { row: 0, col: 3, count: 3, assets: ['High Vol Quote Throttling', 'Exchange Cancel-to-Fill Exceeded', 'Cross-Border Wire Delay'], severity: 'medium', impactLabel: 'Negligible', likelihoodLabel: 'Extreme' },
];

const SEVERITY_COLORS = {
  safe: 0x51cf66,
  medium: 0xfcc419,
  high: 0xff922b,
  critical: 0xff6b6b
};

export const ThreeRiskHeatmap3D: React.FC<ThreeRiskHeatmap3DProps> = ({
  height = 360,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSimulationMode } = useDashboard();
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<CellInfo | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pillarGroupRef = useRef<THREE.Group | null>(null);
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
    camera.position.set(10, 12, 14);
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

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight.position.set(12, 18, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const redAccent = new THREE.PointLight(0xff4444, 2.5, 25);
    redAccent.position.set(4, 5, -4);
    scene.add(redAccent);

    // 5. Grid Base Platform
    const platformGroup = new THREE.Group();
    scene.add(platformGroup);
    pillarGroupRef.current = platformGroup;

    // Base Slab
    const baseGeom = new THREE.BoxGeometry(11, 0.4, 11);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.2,
      metalness: 0.85
    });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = -0.2;
    platformGroup.add(baseMesh);

    // Cyber Edge Glow Border
    const edgeGeom = new THREE.EdgesGeometry(baseGeom);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeom, edgeMat);
    edgeLines.position.y = -0.2;
    platformGroup.add(edgeLines);

    // Grid Floor Lines on top of slab
    const gridHelper = new THREE.GridHelper(9.6, 4, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.01;
    platformGroup.add(gridHelper);

    // 6. 16 Risk Pillars
    const pillarMeshes: { mesh: THREE.Mesh; info: CellInfo }[] = [];
    const spacing = 2.4;
    const startOffset = -3.6;

    HEATMAP_CELLS.forEach(cell => {
      // Coordinates: col = X axis (likelihood), row = -Z axis (impact)
      const x = startOffset + cell.col * spacing;
      const z = startOffset + (3 - cell.row) * spacing;

      // Height scaled by count: simulation mode amplifies high impact cells
      let countMultiplier = cell.count;
      if (isSimulationMode && (cell.row >= 2 || cell.col >= 2)) {
        countMultiplier = Math.round(countMultiplier * 1.6);
      }
      const pillarHeight = Math.max(0.6, countMultiplier * 0.42);

      const pillarGeom = new THREE.BoxGeometry(1.8, pillarHeight, 1.8);
      const colorHex = SEVERITY_COLORS[cell.severity];

      const pillarMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: cell.severity === 'critical' ? 0.65 : cell.severity === 'high' ? 0.45 : 0.25,
        roughness: 0.2,
        metalness: 0.8,
        wireframe,
        transparent: true,
        opacity: 0.92
      });

      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(x, pillarHeight / 2, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      platformGroup.add(pillar);

      // Top glowing cap
      const capGeom = new THREE.BoxGeometry(1.82, 0.08, 1.82);
      const capMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4
      });
      const cap = new THREE.Mesh(capGeom, capMat);
      cap.position.set(x, pillarHeight + 0.04, z);
      platformGroup.add(cap);

      pillarMeshes.push({ mesh: pillar, info: cell });
    });

    // 7. Raycasting for hover inspection
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(pillarMeshes.map(p => p.mesh));

      if (intersects.length > 0) {
        const hit = pillarMeshes.find(p => p.mesh === intersects[0].object);
        if (hit) {
          setHoveredCell(hit.info);
          return;
        }
      }
      setHoveredCell(null);
    };
    renderer.domElement.addEventListener('mousemove', onPointerMove);

    // 8. Drag to rotate
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !platformGroup) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      platformGroup.rotation.y += dx * 0.007;
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

      if (autoRotate && !isDraggingRef.current && platformGroup) {
        platformGroup.rotation.y += 0.004;
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
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.9);
    }
  };
  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.1);
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

      {/* Axis Guide Badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-[#0B0E14]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#273142]/80 text-[10px] font-mono text-[#94A3B8]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-cyan-400" />
          <span>X: Likelihood</span>
        </span>
        <span className="text-[#64748B]">·</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-purple-400" />
          <span>Z: Impact</span>
        </span>
        <span className="text-[#64748B]">·</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-emerald-400" />
          <span>Y: Assets</span>
        </span>
      </div>

      {/* Interactive Hover Tooltip Box */}
      {hoveredCell && (
        <div className="absolute bottom-10 left-3 z-20 max-w-xs bg-[#151B26]/95 backdrop-blur-md p-3 rounded-xl border border-cyan-500/40 shadow-2xl text-xs space-y-1.5 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between font-mono">
            <span className="font-bold text-[#F1F3F5]">{hoveredCell.impactLabel} × {hoveredCell.likelihoodLabel}</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
              hoveredCell.severity === 'critical' ? 'bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/30' :
              hoveredCell.severity === 'high' ? 'bg-[#FF922B]/20 text-[#FF922B] border border-[#FF922B]/30' :
              hoveredCell.severity === 'medium' ? 'bg-[#FCC419]/20 text-[#FCC419] border border-[#FCC419]/30' :
              'bg-[#51CF66]/20 text-[#51CF66] border border-[#51CF66]/30'
            )}>
              {hoveredCell.severity}
            </span>
          </div>
          <div className="text-[11px] font-mono text-cyan-400 font-semibold">
            {hoveredCell.count} Monitored Risk {hoveredCell.count === 1 ? 'Asset' : 'Assets'}
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono space-y-0.5 max-h-20 overflow-hidden">
            {hoveredCell.assets.slice(0, 3).map((a, i) => (
              <div key={i} className="truncate">• {a}</div>
            ))}
            {hoveredCell.assets.length > 3 && (
              <div className="text-[#64748B]">+{hoveredCell.assets.length - 3} more assets...</div>
            )}
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="w-full cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden rounded-xl"
        style={{ height }}
      />

      {/* Legend Footer */}
      <div className="w-full flex items-center justify-between px-3 py-1 bg-[#0B0E14]/60 rounded-lg border border-[#273142]/50 text-[10px] font-mono mt-1 text-[#94A3B8]">
        <span>Drag to orbit 360° · Hover pillars to inspect asset clusters</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#51CF66]" />Safe</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#FCC419]" />Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#FF922B]" />High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#FF6B6B]" />Critical</span>
        </div>
      </div>
    </div>
  );
};
