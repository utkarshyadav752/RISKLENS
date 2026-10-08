import React from 'react';
import { cn } from '../../utils/cn';

interface LimitUsageBarProps {
  current: number;
  max: number;
  unit?: string;
  warningThresholdPct?: number;
  criticalThresholdPct?: number;
  label?: string;
  showLabels?: boolean;
  className?: string;
}

export const LimitUsageBar: React.FC<LimitUsageBarProps> = ({
  current,
  max,
  unit = '$M',
  warningThresholdPct = 75,
  criticalThresholdPct = 90,
  label,
  showLabels = true,
  className
}) => {
  const percentage = Math.min(Math.max((current / max) * 100, 0), 100);

  const isCritical = percentage >= criticalThresholdPct;
  const isWarning = percentage >= warningThresholdPct && percentage < criticalThresholdPct;

  const barColor = isCritical ? 'bg-[#FF6B6B]' : isWarning ? 'bg-[#FF922B]' : 'bg-[#51CF66]';
  const textColor = isCritical ? 'text-[#FF6B6B]' : isWarning ? 'text-[#FF922B]' : 'text-[#51CF66]';

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-mono">
          {label && <span className="text-[#94A3B8] text-[11px] truncate">{label}</span>}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className={cn('font-semibold tabular-nums', textColor)}>
              {percentage.toFixed(1)}%
            </span>
            <span className="text-[#64748B] text-[11px] tabular-nums">
              ({current.toFixed(1)} / {max.toFixed(1)} {unit})
            </span>
          </div>
        </div>
      )}

      {/* Outer track */}
      <div className="w-full h-2.5 bg-[#1F2736] rounded-full overflow-hidden relative border border-[#273142]/40">
        {/* Warning threshold line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#FCC419]/70 z-10"
          style={{ left: `${warningThresholdPct}%` }}
          title={`Warning Limit (${warningThresholdPct}%)`}
        />
        {/* Critical threshold line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#FF6B6B]/90 z-10"
          style={{ left: `${criticalThresholdPct}%` }}
          title={`Critical Limit (${criticalThresholdPct}%)`}
        />

        <div
          className={cn('h-full transition-all duration-300 rounded-full', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
