import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ThreeMonteCarlo3D } from './3d/ThreeMonteCarlo3D';
import { Box, Layers } from 'lucide-react';

interface HistogramBin {
  pnlM: number;
  frequency: number;
  isVaRTail: boolean;
  isExpectedShortfall: boolean;
}

// Generate realistic Bell-curve distribution skewed with fat left tail
const BINS: HistogramBin[] = [
  { pnlM: -75, frequency: 180, isVaRTail: true, isExpectedShortfall: true },
  { pnlM: -70, frequency: 320, isVaRTail: true, isExpectedShortfall: true },
  { pnlM: -65, frequency: 650, isVaRTail: true, isExpectedShortfall: true },
  { pnlM: -60, frequency: 1200, isVaRTail: true, isExpectedShortfall: true },
  { pnlM: -55, frequency: 2100, isVaRTail: true, isExpectedShortfall: true },
  { pnlM: -50, frequency: 3800, isVaRTail: true, isExpectedShortfall: false }, // 99% VaR cutoff ~ -48.6M
  { pnlM: -45, frequency: 6200, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: -40, frequency: 9500, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: -35, frequency: 14100, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: -30, frequency: 19800, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: -25, frequency: 26500, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: -20, frequency: 33400, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: -15, frequency: 38900, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: -10, frequency: 42100, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: -5, frequency: 43200, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: 0, frequency: 41800, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: 5, frequency: 37900, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: 10, frequency: 31200, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: 15, frequency: 23400, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: 20, frequency: 16100, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: 25, frequency: 9800, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: 30, frequency: 5400, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: 35, frequency: 2700, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: 40, frequency: 1100, isVaRTail: false, isExpectedShortfall: false },
  { pnlM: 45, frequency: 400, isVaRTail: false, isExpectedShortfall: false }
];

interface DistributionHistogramProps {
  defaultMode?: '3d' | '2d';
}

export const DistributionHistogram: React.FC<DistributionHistogramProps> = ({
  defaultMode = '3d'
}) => {
  const [renderMode, setRenderMode] = useState<'3d' | '2d'>(defaultMode);
  const [hoveredBin, setHoveredBin] = useState<HistogramBin | null>(null);

  const maxFreq = Math.max(...BINS.map(b => b.frequency));
  const svgHeight = 160;
  const svgWidth = 460;
  const barWidth = 14;
  const barGap = 4;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 3D / 2D Header Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-[#273142]/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#94A3B8]">Simulation Engine:</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
            renderMode === '3d' ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-[#1F2736] text-[#94A3B8]"
          )}>
            {renderMode === '3d' ? '3D Monte Carlo Path Cloud' : '2D P&L Distribution Histogram'}
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
        <ThreeMonteCarlo3D height={340} />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-[#94A3B8]">100,000 Iterations</span>
              <span className="text-[#64748B]">·</span>
              <span className="text-[#FF6B6B] font-semibold">99% VaR: -$48.65M</span>
              <span className="text-[#64748B]">·</span>
              <span className="text-[#FF922B] font-semibold">ES (CVaR): -$62.10M</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#FF6B6B]" />
                <span className="text-[#94A3B8]">Fat Tail (ES)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#38BDF8]" />
                <span className="text-[#94A3B8]">P&L Mass</span>
              </span>
            </div>
          </div>

          <div className="relative w-full overflow-x-auto py-2">
            <svg
              viewBox={`0 0 ${BINS.length * (barWidth + barGap)} ${svgHeight + 25}`}
              className="w-full h-44 overflow-visible"
            >
              {BINS.map((bin, idx) => {
                const barHeight = (bin.frequency / maxFreq) * svgHeight;
                const x = idx * (barWidth + barGap);
                const y = svgHeight - barHeight;
                const isHovered = hoveredBin === bin;

                let fillColor = '#38BDF8';
                if (bin.isExpectedShortfall) fillColor = '#FF6B6B';
                else if (bin.isVaRTail) fillColor = '#FF922B';

                return (
                  <g
                    key={idx}
                    className="cursor-pointer transition-opacity hover:opacity-100"
                    onMouseEnter={() => setHoveredBin(bin)}
                    onMouseLeave={() => setHoveredBin(null)}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={2}
                      fill={fillColor}
                      fillOpacity={isHovered ? 1 : 0.85}
                      className="transition-all duration-150"
                    />

                    {idx % 4 === 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={svgHeight + 16}
                        fill="#64748B"
                        fontSize={9}
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {bin.pnlM}M
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {hoveredBin && (
            <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#273142] flex items-center justify-between text-xs font-mono animate-in fade-in duration-150">
              <span className="text-[#94A3B8]">
                P&L Bin: <span className="text-[#F1F3F5] font-semibold">{hoveredBin.pnlM}M USD</span>
              </span>
              <span className="text-[#94A3B8]">
                Frequency: <span className="text-[#38BDF8] font-bold">{hoveredBin.frequency.toLocaleString()} runs</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
