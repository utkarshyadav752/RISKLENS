import React from 'react';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { cn } from '../../utils/cn';
import { ThreeAlertMiniBeacon3D } from '../visualizations/3d/ThreeAlertMiniBeacon3D';

interface BreachAlertMarqueeProps {
  className?: string;
}

export const BreachAlertMarquee: React.FC<BreachAlertMarqueeProps> = ({ className }) => {
  const { threatLevel, breaches, openDrawer, setThreatLevel } = useDashboard();

  const criticalBreaches = breaches.filter(b => b.status === 'open' && b.severity === 'critical');
  const isCrisis = threatLevel === 'crisis';

  // Only show if crisis or critical breaches exist
  if (!isCrisis && criticalBreaches.length === 0) return null;

  const topBreach = criticalBreaches[0];

  return (
    <aside
      aria-label="3D Critical Breach Alert HUD Banner"
      aria-live="assertive"
      className={cn(
        'w-full bg-red-950/85 backdrop-blur-md border-b border-red-500/60 px-4 py-2 text-xs flex items-center justify-between gap-3 text-red-200 select-none z-30 transition-all shadow-lg shadow-red-950/50',
        className
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* 3D Spinning Hazard Prism Beacon */}
        <div className="shrink-0 flex items-center justify-center p-0.5 rounded-lg bg-red-900/40 border border-red-500/50 shadow-inner">
          <ThreeAlertMiniBeacon3D
            severity="critical"
            size={36}
            isPulsing={true}
          />
        </div>

        <div className="flex items-center gap-2 font-mono truncate">
          <span className="font-bold text-red-100 uppercase tracking-wider text-[11px] bg-red-900/80 px-2 py-0.5 rounded border border-red-500/60 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
            {isCrisis ? 'DEFCON 1 PROTOCOL' : '3D SLA BREACH ALERT'}
          </span>
          <span className="text-[#F1F3F5] text-xs font-semibold truncate">
            {topBreach
              ? `${topBreach.desk}: ${topBreach.title} (Observed: ${topBreach.currentValue}${topBreach.unit} vs Threshold: ${topBreach.thresholdValue}${topBreach.unit})`
              : 'Enterprise trading operations operating under elevated risk governance protocol.'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
        <button
          type="button"
          onClick={() => openDrawer('breaches')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-medium transition-all shadow-md shadow-red-600/30 hover:shadow-red-500/50 focus:outline-none focus:ring-1 focus:ring-white"
        >
          <Sparkles size={12} className="text-yellow-300" />
          <span>Launch 3D Alert Holo-Chamber</span>
          <ArrowRight size={12} />
        </button>

        {isCrisis && (
          <button
            type="button"
            onClick={() => setThreatLevel('normal')}
            className="p-1.5 rounded text-red-300 hover:text-white hover:bg-red-900/60 transition-colors"
            aria-label="Acknowledge crisis alert banner"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </aside>
  );
};
