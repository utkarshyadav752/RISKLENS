import React, { useState, useEffect, useRef } from 'react';
import { Search, User, AlertOctagon, Flame, FileDown, Sliders, ShieldCheck, X, Box } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDashboard } from '../../context/DashboardContext';
import { PERSONA_PROFILES, type PersonaRole } from '../../types/persona';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setPersona,
    setActiveNavTab,
    threatLevel,
    setThreatLevel,
    isSimulationMode,
    toggleSimulationMode,
    tripCircuitBreaker,
    setWidgetCustomizerOpen,
    showToast
  } = useDashboard();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  interface CommandItem {
    id: string;
    category: 'Personas' | 'Actions' | 'Controls' | 'Reports';
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    action: () => void;
  }

  const commands: CommandItem[] = [
    {
      id: 'p-cro',
      category: 'Personas',
      title: 'Switch to Elena Vance (CRO)',
      subtitle: 'Executive capital adequacy & board oversight',
      icon: <User size={16} className="text-blue-400" />,
      action: () => { setPersona('cro'); setCommandPaletteOpen(false); }
    },
    {
      id: 'p-quant',
      category: 'Personas',
      title: 'Switch to Marcus Chen (Quant Analyst)',
      subtitle: 'Monte Carlo 100k, Greeks, correlation surface',
      icon: <User size={16} className="text-purple-400" />,
      action: () => { setPersona('quant'); setCommandPaletteOpen(false); }
    },
    {
      id: 'p-comp',
      category: 'Personas',
      title: 'Switch to Sarah Al-Mansoor (Compliance)',
      subtitle: 'Regulatory breach SLA queue & SEC 15c3-5 audit',
      icon: <User size={16} className="text-emerald-400" />,
      action: () => { setPersona('compliance'); setCommandPaletteOpen(false); }
    },
    {
      id: 'p-desk',
      category: 'Personas',
      title: 'Switch to Liam O\'Connor (Desk Ops)',
      subtitle: 'Intraday margin telemetry & circuit breaker',
      icon: <User size={16} className="text-amber-400" />,
      action: () => { setPersona('desk_ops'); setCommandPaletteOpen(false); }
    },
    {
      id: 'act-3d',
      category: 'Actions',
      title: 'Launch 3D Spatial Risk Universe',
      subtitle: 'Interactive WebGL 3D Volatility Terrain, Globe & Monte Carlo',
      icon: <Box size={16} className="text-blue-400" />,
      action: () => { setActiveNavTab('spatial'); setCommandPaletteOpen(false); }
    },
    {
      id: 'act-sim',
      category: 'Controls',
      title: isSimulationMode ? 'Deactivate Stress Simulation' : 'Activate Stress Simulation (What-If)',
      subtitle: 'Injects +100bps rate shock & VaR spike to $68.4M',
      icon: <Flame size={16} className="text-orange-400" />,
      action: () => { toggleSimulationMode(); setCommandPaletteOpen(false); }
    },
    {
      id: 'act-threat',
      category: 'Controls',
      title: threatLevel === 'crisis' ? 'De-escalate Threat to Normal' : 'Escalate Threat to Crisis Mode (DEFCON 1)',
      subtitle: 'Global alert marquee and defensive postures',
      icon: <AlertOctagon size={16} className="text-red-400" />,
      action: () => {
        setThreatLevel(threatLevel === 'crisis' ? 'normal' : 'crisis');
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'act-freeze',
      category: 'Actions',
      title: 'Trip Emergency Circuit Breaker',
      subtitle: 'Immediately freezes all algorithmic order execution',
      icon: <ShieldCheck size={16} className="text-red-500" />,
      action: () => { tripCircuitBreaker(); setCommandPaletteOpen(false); }
    },
    {
      id: 'act-export',
      category: 'Reports',
      title: 'Export Board Executive PDF Dossier',
      subtitle: 'Download signed compliance report',
      icon: <FileDown size={16} className="text-emerald-400" />,
      action: () => {
        setCommandPaletteOpen(false);
        showToast('Export Initiated', 'Generating Board Risk PDF with SHA-256 signatures.', 'safe');
      }
    },
    {
      id: 'act-customize',
      category: 'Controls',
      title: 'Customize Dashboard Widgets',
      subtitle: 'Toggle visibility of cards and telemetries',
      icon: <Sliders size={16} className="text-blue-400" />,
      action: () => { setCommandPaletteOpen(false); setWidgetCustomizerOpen(true); }
    }
  ];

  const filteredCommands = commands.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    (c.subtitle && c.subtitle.toLowerCase().includes(query.toLowerCase())) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[#151B26] border border-[#273142] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#273142] gap-3">
          <Search size={18} className="text-[#64748B] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, action, or persona switch..."
            className="w-full bg-transparent text-sm text-[#F1F3F5] placeholder-[#64748B] focus:outline-none font-sans"
          />
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded text-[#64748B] hover:text-[#F1F3F5]"
            aria-label="Close command palette"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#273142]/30">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#64748B] font-mono">
              No actions match &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors',
                    isSelected ? 'bg-[#1F2736] text-[#F1F3F5]' : 'text-[#94A3B8] hover:bg-[#1F2736]/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-[#0B0E14] border border-[#273142]">
                      {cmd.icon}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#F1F3F5]">{cmd.title}</div>
                      {cmd.subtitle && (
                        <div className="text-[11px] text-[#64748B]">{cmd.subtitle}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] border border-[#273142] px-1.5 py-0.5 rounded uppercase">
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-[#0B0E14] border-t border-[#273142] text-[11px] font-mono text-[#64748B]">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>·</span>
            <span>↵ Select</span>
            <span>·</span>
            <span>ESC Close</span>
          </div>
          <span>RiskLens Core v2.4</span>
        </div>
      </div>
    </div>
  );
};
