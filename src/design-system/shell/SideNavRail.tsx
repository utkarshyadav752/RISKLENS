import React, { useState } from 'react';
import {
  LayoutDashboard,
  LineChart,
  ShieldAlert,
  Cpu,
  FileCode2,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Box
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDashboard } from '../../context/DashboardContext';
import type { PersonaRole } from '../../types/persona';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  targetPersona?: PersonaRole;
  badgeCount?: number;
}

interface SideNavRailProps {
  className?: string;
  activeNavTab: string;
  onSelectNavTab: (tabId: string) => void;
}

export const SideNavRail: React.FC<SideNavRailProps> = ({
  className,
  activeNavTab,
  onSelectNavTab
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { setPersona, breaches, setWidgetCustomizerOpen } = useDashboard();

  const openBreachesCount = breaches.filter(b => b.status === 'open').length;

  const navItems: NavItem[] = [
    {
      id: 'cro',
      label: 'Executive CRO',
      icon: <LayoutDashboard size={18} />,
      targetPersona: 'cro'
    },
    {
      id: 'quant',
      label: 'Quantitative Analytics',
      icon: <LineChart size={18} />,
      targetPersona: 'quant'
    },
    {
      id: 'compliance',
      label: 'Surveillance & Audit',
      icon: <ShieldAlert size={18} />,
      targetPersona: 'compliance',
      badgeCount: openBreachesCount
    },
    {
      id: 'desk_ops',
      label: 'Trading Floor Desks',
      icon: <Cpu size={18} />,
      targetPersona: 'desk_ops'
    },
    {
      id: 'spatial',
      label: '3D Spatial Universe',
      icon: <Box size={18} className="text-blue-400" />
    },
    {
      id: 'docs',
      label: 'Dossier Docs',
      icon: <FileCode2 size={18} />
    }
  ];

  const handleSelect = (item: NavItem) => {
    onSelectNavTab(item.id);
    if (item.targetPersona) {
      setPersona(item.targetPersona);
    }
  };

  return (
    <aside
      aria-label="Sidebar Navigation Rail"
      className={cn(
        'h-screen sticky top-0 bg-[#0B0E14] border-r border-[#273142] flex flex-col justify-between transition-all duration-200 z-30 shrink-0 select-none',
        collapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      <div>
        {/* Rail Header with Brand Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[#273142] gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold font-mono text-white text-base shadow-md shrink-0">
            Zθ
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold tracking-tight text-sm text-[#F1F3F5] truncate">
                RiskLens Console
              </span>
              <span className="text-[10px] font-mono text-[#64748B] truncate">
                ZeTheta Algorithms
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map(item => {
            const isActive = activeNavTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors relative group focus:outline-none focus:ring-1 focus:ring-blue-500',
                  isActive
                    ? 'bg-[#1F2736] text-[#F1F3F5] shadow-sm font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#151B26]'
                )}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <span className={cn('shrink-0', isActive ? 'text-blue-400' : 'text-[#94A3B8]')}>
                  {item.icon}
                </span>

                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Notification Badge */}
                {item.badgeCount && item.badgeCount > 0 && (
                  <span
                    className={cn(
                      'ml-auto text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#FF6B6B] text-white',
                      collapsed && 'absolute top-1.5 right-1.5 w-4 h-4 p-0 flex items-center justify-center text-[9px]'
                    )}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rail Footer */}
      <div className="p-2 border-t border-[#273142] space-y-1">
        <button
          type="button"
          onClick={() => setWidgetCustomizerOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#151B26] transition-colors"
          title="Customize Dashboard Layout"
        >
          <Sliders size={16} className="shrink-0" />
          {!collapsed && <span>Customize Cards</span>}
        </button>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-[#64748B] hover:text-[#F1F3F5] hover:bg-[#151B26] rounded-lg transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2 text-xs"><ChevronLeft size={16} /><span>Collapse</span></div>}
        </button>
      </div>
    </aside>
  );
};
