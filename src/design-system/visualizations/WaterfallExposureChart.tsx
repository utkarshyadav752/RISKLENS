import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ThreeWaterfall3D } from './3d/ThreeWaterfall3D';
import { Box, Layers } from 'lucide-react';

interface ExposureFactor {
  factor: string;
  exposureM: number;
  percentageOfCapital: number;
  deltaPercent: number;
}

const FACTORS: ExposureFactor[] = [
  { factor: 'Equities Market Beta', exposureM: 142.5, percentageOfCapital: 34.2, deltaPercent: 3.1 },
  { factor: 'Rates Duration Risk', exposureM: 98.2, percentageOfCapital: 23.5, deltaPercent: -1.4 },
  { factor: 'Corporate Credit Spreads', exposureM: 64.0, percentageOfCapital: 15.3, deltaPercent: 5.8 },
  { factor: 'FX Cross-Currency Vol', exposureM: 49.3, percentageOfCapital: 11.8, deltaPercent: 12.4 },
  { factor: 'Commodity Term Structure', exposureM: 35.8, percentageOfCapital: 8.6, deltaPercent: -0.8 },
  { factor: 'Crypto Basis Dislocation', exposureM: 27.2, percentageOfCapital: 6.6, deltaPercent: 18.2 }
];

interface WaterfallExposureChartProps {
  defaultMode?: '3d' | '2d';
}

export const WaterfallExposureChart: React.FC<WaterfallExposureChartProps> = ({
  defaultMode = '3d'
}) => {
  const [renderMode, setRenderMode] = useState<'3d' | '2d'>(defaultMode);
  const maxExposure = Math.max(...FACTORS.map(f => f.exposureM));

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 3D / 2D Toggle Switcher Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#273142]/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#94A3B8]">Attribution Engine:</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
            renderMode === '3d' ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-[#1F2736] text-[#94A3B8]"
          )}>
            {renderMode === '3d' ? '3D Spatial Pillar Manifold' : '2D Planar Horizontal Stack'}
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
        <ThreeWaterfall3D height={290} />
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span>Factor Breakdown ($417.0M Total Portfolio Notional)</span>
            <span className="text-[#64748B]">Capacity Cap: $500.0M</span>
          </div>

          {FACTORS.map((item, idx) => {
            const widthPct = (item.exposureM / maxExposure) * 100;
            const isHigh = item.percentageOfCapital > 25;

            return (
              <div key={idx} className="flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[#F1F3F5] text-[11px] font-medium">{item.factor}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F1F3F5] font-semibold tabular-nums">
                      ${item.exposureM.toFixed(1)}M
                    </span>
                    <span className="text-[#64748B] text-[11px] tabular-nums">
                      ({item.percentageOfCapital.toFixed(1)}%)
                    </span>
                    <span
                      className={cn(
                        'text-[10px] tabular-nums',
                        item.deltaPercent > 0 ? 'text-[#FF6B6B]' : 'text-[#51CF66]'
                      )}
                    >
                      {item.deltaPercent > 0 ? `+${item.deltaPercent}%` : `${item.deltaPercent}%`}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#1F2736] rounded-full overflow-hidden flex">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isHigh ? 'bg-gradient-to-r from-blue-500 to-amber-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
