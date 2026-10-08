import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { cn } from '../../utils/cn';
import { ThreeVaRGauge3D } from './3d/ThreeVaRGauge3D';
import { Box, Layers } from 'lucide-react';

interface VaRGaugeProps {
  currentValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  maxScale?: number;
  confidenceInterval?: string;
  className?: string;
  defaultMode?: '3d' | '2d';
}

export const VaRGauge: React.FC<VaRGaugeProps> = ({
  currentValue: propCurrentValue,
  warningThreshold = 45.0,
  criticalThreshold = 50.0,
  maxScale = 80.0,
  confidenceInterval = '99.0% / 1-Day Horizon',
  className,
  defaultMode = '3d'
}) => {
  const { isSimulationMode } = useDashboard();
  const [renderMode, setRenderMode] = useState<'3d' | '2d'>(defaultMode);

  // If simulation mode is active and no explicit prop, show stressed VaR
  const currentValue = propCurrentValue ?? (isSimulationMode ? 68.4 : 42.8);

  // SVG Gauge calculations (semi-circle from 180deg to 0deg)
  const radius = 90;
  const strokeWidth = 14;
  const center = 110;

  // Clamped ratio from 0 to 1
  const ratio = Math.min(Math.max(currentValue / maxScale, 0), 1);
  const angle = 180 * ratio; // 0 to 180 degrees
  const angleRad = (Math.PI / 180) * (180 - angle);

  // Needle tip coordinates
  const needleLength = radius - 15;
  const needleX = center + needleLength * Math.cos(angleRad);
  const needleY = center - needleLength * Math.sin(angleRad);

  const isWarning = currentValue >= warningThreshold && currentValue < criticalThreshold;
  const isCritical = currentValue >= criticalThreshold;

  const statusColor = isCritical ? '#FF6B6B' : isWarning ? '#FF922B' : '#51CF66';
  const statusLabel = isCritical ? 'REGULATORY LIMIT BREACHED' : isWarning ? 'WARNING THRESHOLD' : 'WITHIN RISK BUDGET';

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {/* 3D / 2D Toggle Switcher Header */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-[#273142]/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#94A3B8]">Telemetry Mode:</span>
          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
            renderMode === '3d' ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-[#1F2736] text-[#94A3B8]"
          )}>
            {renderMode === '3d' ? '3D WebGL Hologram' : '2D Planar SVG'}
          </span>
        </div>

        <div className="flex items-center bg-[#0B0E14] p-0.5 rounded-lg border border-[#273142] text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setRenderMode('3d')}
            className={cn(
              'px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-colors',
              renderMode === '3d' ? 'bg-[#1F2736] text-cyan-400 shadow-sm' : 'text-[#94A3B8] hover:text-[#F1F3F5]'
            )}
          >
            <Box size={11} /> 3D
          </button>
          <button
            type="button"
            onClick={() => setRenderMode('2d')}
            className={cn(
              'px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-colors',
              renderMode === '2d' ? 'bg-[#1F2736] text-cyan-400 shadow-sm' : 'text-[#94A3B8] hover:text-[#F1F3F5]'
            )}
          >
            <Layers size={11} /> 2D
          </button>
        </div>
      </div>

      {renderMode === '3d' ? (
        <ThreeVaRGauge3D
          currentValue={currentValue}
          warningThreshold={warningThreshold}
          criticalThreshold={criticalThreshold}
          maxScale={maxScale}
          height={230}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-3 text-center">
          <div className="relative w-56 h-32 flex items-center justify-center overflow-visible">
            <svg viewBox="0 0 220 130" className="w-full h-full overflow-visible">
              {/* Background arc track */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="#1F2736"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />

              {/* Safe zone arc (0 to warningThreshold) */}
              <path
                d="M 20 110 A 90 90 0 0 1 140 28"
                fill="none"
                stroke="#51CF66"
                strokeWidth={strokeWidth - 4}
                strokeOpacity={0.8}
              />

              {/* Warning zone arc */}
              <path
                d="M 140 28 A 90 90 0 0 1 175 52"
                fill="none"
                stroke="#FCC419"
                strokeWidth={strokeWidth - 4}
                strokeOpacity={0.8}
              />

              {/* Critical zone arc */}
              <path
                d="M 175 52 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="#FF6B6B"
                strokeWidth={strokeWidth - 4}
                strokeOpacity={0.8}
              />

              {/* Needle */}
              <line
                x1={center}
                y1={center}
                x2={needleX}
                y2={needleY}
                stroke={statusColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              {/* Center pivot */}
              <circle cx={center} cy={center} r="7" fill="#151B26" stroke={statusColor} strokeWidth="3" />
              <circle cx={center} cy={center} r="3" fill={statusColor} />
            </svg>
          </div>

          <div className="mt-2 flex flex-col items-center">
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-extrabold tracking-tight" style={{ color: statusColor }}>
                ${currentValue.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-[#94A3B8]">M</span>
            </div>

            <div
              className="mt-1 text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${statusColor}15`,
                color: statusColor,
                border: `1px solid ${statusColor}40`
              }}
            >
              {statusLabel}
            </div>

            <span className="text-[10px] text-[#64748B] font-mono mt-1">
              Confidence: {confidenceInterval}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
