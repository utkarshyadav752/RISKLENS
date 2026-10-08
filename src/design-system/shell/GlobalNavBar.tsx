import React, { useState } from 'react';
import { Bell, Command, Radio, Sparkles, Box, Layers, Palette } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { PersonaSwitcher } from './PersonaSwitcher';
import { ExportDropdown } from '../controls/ExportDropdown';
import { ToggleSwitch } from '../controls/ToggleSwitch';
import { cn } from '../../utils/cn';
import type { SystemThreatLevel } from '../../types/risk';
import type { BackgroundThemeMode } from './ThreeBackground3D';

interface GlobalNavBarProps {
  className?: string;
  bgMode?: BackgroundThemeMode;
  onSelectBgMode?: (mode: BackgroundThemeMode) => void;
}

export const GlobalNavBar: React.FC<GlobalNavBarProps> = ({
  className,
  bgMode = 'nebula',
  onSelectBgMode
}) => {
  const [bgMenuOpen, setBgMenuOpen] = useState(false);
  const {
    threatLevel,
    setThreatLevel,
    isSimulationMode,
    toggleSimulationMode,
    setCommandPaletteOpen,
    breaches,
    liveSocketLatencyMs,
    openDrawer,
    activeNavTab,
    setActiveNavTab
  } = useDashboard();

  const openBreachesCount = breaches.filter(b => b.status === 'open').length;

  const threatStyles: Record<SystemThreatLevel, string> = {
    normal: 'text-[#51CF66] border-[#51CF66]/40 bg-[#51CF66]/10',
    elevated: 'text-[#FF922B] border-[#FF922B]/40 bg-[#FF922B]/10',
    crisis: 'text-[#FF6B6B] border-[#FF6B6B]/40 bg-[#FF6B6B]/15 animate-pulse'
  };

  return (
    <header
      className={cn(
        'h-16 px-4 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#273142] sticky top-0 z-40 flex items-center justify-between gap-4 select-none',
        className
      )}
    >
      {/* Zone 1: Brand wordmark & Persona Switcher */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-[#F1F3F5]">
            RiskLens
          </span>
          <span className="text-xs font-mono text-[#64748B]">v2.4</span>
        </div>

        <PersonaSwitcher />
      </div>

      {/* Zone 2: System Threat Selector & Stress Simulation Mode */}
      <div className="hidden md:flex items-center gap-3">
        {/* Threat Level Selector */}
        <div className="flex items-center gap-1 bg-[#151B26] p-1 rounded-lg border border-[#273142]">
          {(['normal', 'elevated', 'crisis'] as SystemThreatLevel[]).map(level => {
            const isSelected = threatLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setThreatLevel(level)}
                className={cn(
                  'px-2 py-1 text-[11px] font-mono rounded font-medium transition-colors uppercase',
                  isSelected
                    ? threatStyles[level]
                    : 'text-[#94A3B8] hover:text-[#F1F3F5]'
                )}
              >
                {level}
              </button>
            );
          })}
        </div>

        {/* Simulation Toggle */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#273142]">
          <ToggleSwitch
            checked={isSimulationMode}
            onChange={toggleSimulationMode}
            label="Stress Sim"
            size="sm"
          />
          {isSimulationMode && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FF922B]/20 text-[#FF922B] font-mono text-[10px] font-bold">
              <Sparkles size={11} /> +100bps
            </span>
          )}
        </div>
      </div>

      {/* Zone 3: Actions & Live Indicators */}
      <div className="flex items-center gap-2.5">
        {/* 3D Holo Background Theme Switcher */}
        {onSelectBgMode && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setBgMenuOpen(!bgMenuOpen)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all shadow-sm',
                bgMode !== 'off'
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:border-cyan-500/70'
                  : 'bg-[#151B26] border-[#273142] text-[#94A3B8] hover:text-[#F1F3F5]'
              )}
              title="Configure 3D Spatial Background"
            >
              <Palette size={13} className="text-cyan-400" />
              <span className="hidden lg:inline capitalize">3D BG: {bgMode}</span>
            </button>

            {bgMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[#151B26]/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl shadow-2xl p-1.5 z-50 text-xs font-mono space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] text-[#64748B] uppercase tracking-wider font-bold">
                  3D Spatial Backdrop
                </div>
                {[
                  { id: 'quantum-grid', name: '⚡ Quantum Cyber Grid' },
                  { id: 'cyber-rings', name: '🪐 Celestial Gyro Rings' },
                  { id: 'nebula', name: '🌌 Deep Cyber Nebula' },
                  { id: 'constellation', name: '✨ Risk Constellation' },
                  { id: 'hyperdrive', name: '🚀 Hyperdrive Warp' },
                  { id: 'off', name: '🚫 Disable 3D Background' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectBgMode(item.id as any);
                      setBgMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left',
                      bgMode === item.id
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#1F2736]'
                    )}
                  >
                    <span>{item.name}</span>
                    {bgMode === item.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3D Spatial Universe Quick Launch */}
        <button
          type="button"
          onClick={() => setActiveNavTab('spatial')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all shadow-sm',
            activeNavTab === 'spatial'
              ? 'bg-blue-600/30 text-blue-400 border-blue-500/60 ring-1 ring-blue-500/30'
              : 'bg-[#151B26] border-blue-500/30 text-blue-300 hover:bg-[#1F2736] hover:border-blue-500/60'
          )}
          title="Launch 3D Spatial Risk Universe"
        >
          <Box size={14} className="text-blue-400 animate-pulse" />
          <span className="hidden md:inline">3D Universe</span>
        </button>

        {/* Live WebSocket Heartbeat */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#151B26] border border-[#273142] text-[11px] font-mono text-[#94A3B8]"
          title="Telemetry Connection Heartbeat"
        >
          <Radio size={12} className="text-[#51CF66] animate-pulse" />
          <span className="text-[#51CF66] font-semibold">LIVE</span>
          <span>·</span>
          <span>{liveSocketLatencyMs}ms</span>
        </div>

        {/* Command Palette Button */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#151B26] border border-[#273142] text-xs font-mono text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#1F2736] transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Open command palette (Cmd+K)"
        >
          <Command size={13} />
          <span className="hidden sm:inline">⌘K</span>
        </button>

        {/* Notifications / Breaches Bell */}
        <button
          type="button"
          onClick={() => openDrawer('breaches')}
          className="relative p-2 rounded-lg bg-[#151B26] border border-[#273142] text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#1F2736] transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Active breach notifications"
        >
          <Bell size={15} />
          {openBreachesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6B6B] text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
              {openBreachesCount}
            </span>
          )}
        </button>

        {/* Export Dropdown */}
        <ExportDropdown />
      </div>
    </header>
  );
};
