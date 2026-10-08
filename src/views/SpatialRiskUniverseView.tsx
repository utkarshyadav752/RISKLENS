import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ThreeRiskTerrain3D } from '../design-system/visualizations/3d/ThreeRiskTerrain3D';
import { ThreeRiskGlobe3D } from '../design-system/visualizations/3d/ThreeRiskGlobe3D';
import { ThreeMonteCarlo3D } from '../design-system/visualizations/3d/ThreeMonteCarlo3D';
import { ThreeDesksHologram3D } from '../design-system/visualizations/3d/ThreeDesksHologram3D';
import { ThreeAlertCommandCenter3D } from '../design-system/visualizations/3d/ThreeAlertCommandCenter3D';
import { ThreeComplianceVault3D } from '../design-system/visualizations/3d/ThreeComplianceVault3D';
import { MetricCallout } from '../design-system/primitives/MetricCallout';
import { Button } from '../design-system/primitives/Button';
import { Box, Globe, Activity, Cpu, ShieldAlert, Flame, AlertOctagon, Lock } from 'lucide-react';
import { cn } from '../utils/cn';

type SpatialMode = 'terrain' | 'globe' | 'montecarlo' | 'desks' | 'alerts' | 'vault';

export const SpatialRiskUniverseView: React.FC = () => {
  const [activeSpatialMode, setActiveSpatialMode] = useState<SpatialMode>('alerts');
  const { isSimulationMode, toggleSimulationMode, isCircuitBreakerTripped, tripCircuitBreaker, resetCircuitBreaker } = useDashboard();

  const spatialModes = [
    {
      id: 'alerts' as SpatialMode,
      name: '3D Alert Radar & Topology',
      icon: <AlertOctagon size={16} className="text-red-400" />,
      desc: 'Realtime spatial hazard reactor with orbiting SLA incident beacons.'
    },
    {
      id: 'terrain' as SpatialMode,
      name: '3D Volatility Terrain',
      icon: <Box size={16} className="text-blue-400" />,
      desc: 'Dynamic parametric loss landscape with realtime wave dislocations.'
    },
    {
      id: 'globe' as SpatialMode,
      name: '3D Counterparty Globe',
      icon: <Globe size={16} className="text-cyan-400" />,
      desc: 'Global financial hub network & geodesic capital transaction arcs.'
    },
    {
      id: 'montecarlo' as SpatialMode,
      name: '3D Monte Carlo Cloud',
      icon: <Activity size={16} className="text-purple-400" />,
      desc: '6,500 Phase-space path dispersion vectors with 99% VaR slice plane.'
    },
    {
      id: 'desks' as SpatialMode,
      name: '3D Desks Hologram',
      icon: <Cpu size={16} className="text-amber-400" />,
      desc: 'Real-time margin towers with emergency forcefield containment.'
    },
    {
      id: 'vault' as SpatialMode,
      name: '3D WORM Crypto Vault',
      icon: <Lock size={16} className="text-emerald-400" />,
      desc: 'Cryptographic SHA-256 Merkle ring lock & immutable regulatory ledger.'
    }
  ];

  return (
    <div className="space-y-5">
      {/* 3D Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#151B26]/85 backdrop-blur-md border border-[#273142] glow-blue">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/40 flex items-center justify-center font-mono text-blue-400 font-bold text-lg shadow-lg">
            <Box size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#F1F3F5] tracking-tight">
                3D Spatial Telemetry &amp; Alert Universe
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 uppercase">
                WebGL 2.0 Engine
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
              Interactive 3D risk manifold, real-time alert topology, counterparty geodesics &amp; Monte Carlo phase space
            </p>
          </div>
        </div>

        {/* Quick 3D Simulation Mutators */}
        <div className="flex items-center gap-2.5">
          <Button
            variant={isSimulationMode ? 'danger' : 'outline'}
            size="sm"
            leftIcon={<Flame size={14} className={isSimulationMode ? 'animate-bounce' : ''} />}
            onClick={toggleSimulationMode}
          >
            {isSimulationMode ? 'Deactivate 3D Shock' : 'Inject 3D Market Shock'}
          </Button>

          {isCircuitBreakerTripped ? (
            <Button
              variant="outline"
              size="sm"
              onClick={resetCircuitBreaker}
            >
              Reset 3D Shields
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<ShieldAlert size={14} />}
              onClick={() => tripCircuitBreaker()}
            >
              Forcefield Contain
            </Button>
          )}
        </div>
      </div>

      {/* 3D Mode Selector Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {spatialModes.map(mode => {
          const isActive = activeSpatialMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveSpatialMode(mode.id)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group',
                isActive
                  ? 'bg-[#1F2736] border-blue-500/80 shadow-xl ring-1 ring-blue-500/30'
                  : 'bg-[#151B26] border-[#273142] hover:bg-[#1F2736]/60 hover:border-blue-500/30'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn('p-1.5 rounded-lg border', isActive ? 'bg-blue-600/30 text-blue-400 border-blue-500/40' : 'bg-[#0B0E14] text-[#94A3B8] border-[#273142]')}>
                  {mode.icon}
                </span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F1F3F5] tracking-tight">{mode.name}</h3>
                <p className="text-[10px] text-[#64748B] font-mono mt-0.5 line-clamp-2 leading-relaxed">{mode.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Primary 3D Canvas Showcase Viewport */}
      <div className="p-2 rounded-2xl bg-[#151B26]/90 border border-[#273142] shadow-2xl relative">
        {activeSpatialMode === 'alerts' && (
          <ThreeAlertCommandCenter3D className="border-0 bg-transparent min-h-[480px]" />
        )}
        {activeSpatialMode === 'terrain' && (
          <ThreeRiskTerrain3D height={480} />
        )}
        {activeSpatialMode === 'globe' && (
          <ThreeRiskGlobe3D height={480} />
        )}
        {activeSpatialMode === 'montecarlo' && (
          <ThreeMonteCarlo3D height={480} />
        )}
        {activeSpatialMode === 'desks' && (
          <ThreeDesksHologram3D height={480} />
        )}
        {activeSpatialMode === 'vault' && (
          <ThreeComplianceVault3D height={480} />
        )}
      </div>

      {/* Secondary 3D Telemetry Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCallout
          title="3D Manifold Curvature (κ)"
          value={isSimulationMode ? '1.84' : '0.42'}
          benchmark="< 0.60 Nominal"
          deltaPercent={isSimulationMode ? 338 : -4.2}
          deltaDirection={isSimulationMode ? 'up' : 'down'}
          severity={isSimulationMode ? 'critical' : 'safe'}
          subtitle="Non-Euclidean Volatility Geodesic"
          sparklineData={isSimulationMode ? [0.4, 0.6, 1.1, 1.5, 1.84] : [0.45, 0.44, 0.42]}
        />

        <MetricCallout
          title="Global Geodesic Flow Rate"
          value="$2.41B"
          unit="/ hr"
          benchmark="$3.0B Max"
          deltaPercent={8.5}
          deltaDirection="up"
          severity="safe"
          subtitle="SWIFT & Interbank Photon Mesh"
          sparklineData={[2.1, 2.2, 2.35, 2.41]}
        />

        <MetricCallout
          title="Phase-Space Tail Mass"
          value={isSimulationMode ? '4.82%' : '1.00%'}
          benchmark="1.00% Statutory"
          deltaPercent={isSimulationMode ? 382 : 0}
          deltaDirection={isSimulationMode ? 'up' : 'neutral'}
          severity={isSimulationMode ? 'critical' : 'safe'}
          subtitle="Monte Carlo Extreme Tail Runoff"
          sparklineData={isSimulationMode ? [1.0, 1.5, 2.4, 3.8, 4.82] : [1.0, 1.0, 1.0]}
        />

        <MetricCallout
          title="Algorithmic Hologram Integrity"
          value={isCircuitBreakerTripped ? 'CONTAINED' : '100%'}
          benchmark="5 Desks Synced"
          deltaPercent={0}
          severity={isCircuitBreakerTripped ? 'critical' : 'safe'}
          subtitle="Realtime GPU Render Shaders"
        />
      </div>
    </div>
  );
};
