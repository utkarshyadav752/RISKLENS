import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Box } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SeverityLevel } from '../../types/risk';
import { RiskBadge } from './RiskBadge';
import { LiveSparkline } from '../visualizations/LiveSparkline';
import { ThreeMetricBadge3D, type MetricBadgeShape } from '../visualizations/3d/ThreeMetricBadge3D';

interface MetricCalloutProps {
  title: string;
  value: string;
  unit?: string;
  benchmark?: string;
  deltaPercent?: number;
  deltaDirection?: 'up' | 'down' | 'neutral';
  severity?: SeverityLevel;
  sparklineData?: number[];
  subtitle?: string;
  className?: string;
  enable3D?: boolean;
}

export const MetricCallout: React.FC<MetricCalloutProps> = ({
  title,
  value,
  unit,
  benchmark,
  deltaPercent,
  deltaDirection = 'neutral',
  severity,
  sparklineData,
  subtitle,
  className,
  enable3D = true
}) => {
  const [show3DBadge, setShow3DBadge] = useState(enable3D);

  const getDeltaColor = () => {
    if (deltaDirection === 'up') return 'text-[#FF6B6B]'; // Risk up is cautionary/critical in risk monitoring
    if (deltaDirection === 'down') return 'text-[#51CF66]'; // Risk down is favorable
    return 'text-[#94A3B8]';
  };

  const renderDeltaIcon = () => {
    if (deltaDirection === 'up') return <ArrowUpRight size={14} className="stroke-[2.5]" />;
    if (deltaDirection === 'down') return <ArrowDownRight size={14} className="stroke-[2.5]" />;
    return <Minus size={14} className="stroke-[2.5]" />;
  };

  // Derive dynamic 3D shape based on title
  const getBadgeShape = (): MetricBadgeShape => {
    const t = title.toLowerCase();
    if (t.includes('var') || t.includes('limit') || t.includes('utilization') || t.includes('threat')) return 'gyro';
    if (t.includes('capital') || t.includes('p&l') || t.includes('peak') || t.includes('notional')) return 'cube';
    if (t.includes('delta') || t.includes('sharpe') || t.includes('vol') || t.includes('garch') || t.includes('rate')) return 'delta';
    return 'torus';
  };

  const sentiment =
    deltaDirection === 'down'
      ? 'positive'
      : deltaDirection === 'up'
      ? 'negative'
      : 'neutral';

  return (
    <div
      className={cn(
        'group relative bg-[#151B26]/90 backdrop-blur-md border border-[#273142]/80 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:border-[#3B82F6]/70 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 overflow-hidden',
        className
      )}
    >
      {/* Subtle top scanline glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header with Title, Severity Badge & 3D Mini Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {show3DBadge && (
            <div className="shrink-0 p-0.5 rounded-lg bg-[#0B0E14]/80 border border-[#273142] shadow-inner">
              <ThreeMetricBadge3D
                shape={getBadgeShape()}
                severity={severity}
                sentiment={sentiment}
                size={34}
              />
            </div>
          )}
          <span className="text-xs font-semibold text-[#94A3B8] tracking-wider uppercase">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {severity && <RiskBadge severity={severity} size="sm" />}
          <button
            type="button"
            onClick={() => setShow3DBadge(!show3DBadge)}
            className="p-1 rounded text-[#64748B] hover:text-[#38BDF8] hover:bg-[#1F2736] transition-colors"
            title={show3DBadge ? 'Hide 3D Micro-Hologram' : 'Show 3D Micro-Hologram'}
          >
            <Box size={12} className={show3DBadge ? 'text-[#38BDF8]' : ''} />
          </button>
        </div>
      </div>

      {/* Main Metric Value and Visualizer */}
      <div className="flex items-baseline justify-between gap-3 mt-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-[#F1F3F5] tabular-nums group-hover:text-blue-100 transition-colors">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-[#94A3B8] font-medium">
              {unit}
            </span>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="w-24 h-8 shrink-0">
            <LiveSparkline
              data={sparklineData}
              strokeColor={
                severity === 'critical' ? '#FF6B6B' :
                severity === 'high' ? '#FF922B' :
                severity === 'medium' ? '#FCC419' : '#51CF66'
              }
              height={32}
              width={96}
            />
          </div>
        )}
      </div>

      {/* Footer Benchmark & Subtitle */}
      <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#273142]/60 font-mono">
        <div className="flex items-center gap-1.5">
          {deltaPercent !== undefined && (
            <span className={cn('flex items-center font-medium text-[11px]', getDeltaColor())}>
              {renderDeltaIcon()}
              <span>{Math.abs(deltaPercent)}%</span>
            </span>
          )}
          {subtitle && (
            <span className="text-[#64748B] text-[11px] truncate max-w-[130px]">
              {subtitle}
            </span>
          )}
        </div>

        {benchmark && (
          <span className="text-[#64748B] text-[11px] tabular-nums">
            Lim: {benchmark}
          </span>
        )}
      </div>
    </div>
  );
};
