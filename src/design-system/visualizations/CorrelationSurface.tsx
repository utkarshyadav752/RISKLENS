import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ThreeCorrelationSurface3D } from './3d/ThreeCorrelationSurface3D';
import { Box, Layers } from 'lucide-react';

interface AssetPair {
  row: string;
  col: string;
  corr: number;
}

const ASSET_CLASSES = ['Equities', 'FX (G10)', 'Rates', 'Commodities', 'Crypto'];

const CORRELATION_MATRIX: number[][] = [
  // Equities, FX, Rates, Commodities, Crypto
  [1.00,  0.42, -0.38,  0.55,  0.68], // Equities
  [0.42,  1.00,  0.15, -0.22,  0.31], // FX
  [-0.38, 0.15,  1.00, -0.45, -0.18], // Rates
  [0.55, -0.22, -0.45,  1.00,  0.24], // Commodities
  [0.68,  0.31, -0.18,  0.24,  1.00]  // Crypto
];

interface CorrelationSurfaceProps {
  defaultMode?: '3d' | '2d';
}

export const CorrelationSurface: React.FC<CorrelationSurfaceProps> = ({
  defaultMode = '3d'
}) => {
  const [renderMode, setRenderMode] = useState<'3d' | '2d'>(defaultMode);
  const [selectedPair, setSelectedPair] = useState<AssetPair | null>(null);

  const getHeatmapColor = (corr: number) => {
    if (corr === 1.0) return 'bg-blue-600/40 text-blue-300 font-semibold border-blue-500/50';
    if (corr > 0.5) return 'bg-[#FF6B6B]/25 text-[#FF6B6B] border-[#FF6B6B]/40'; // High positive co-movement
    if (corr > 0.2) return 'bg-[#FF922B]/20 text-[#FF922B] border-[#FF922B]/35';
    if (corr >= -0.2 && corr <= 0.2) return 'bg-[#1F2736]/60 text-[#94A3B8] border-[#273142]'; // Uncorrelated
    if (corr < -0.2 && corr >= -0.5) return 'bg-[#4DABF7]/20 text-[#4DABF7] border-[#4DABF7]/35';
    return 'bg-[#51CF66]/25 text-[#51CF66] border-[#51CF66]/40'; // Strong negative correlation (diversifier)
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 3D / 2D Header Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-[#273142]/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#94A3B8]">Coupling Manifold:</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
            renderMode === '3d' ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-[#1F2736] text-[#94A3B8]"
          )}>
            {renderMode === '3d' ? '3D WebGL Topography Surface' : '2D Correlation Matrix'}
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
        <ThreeCorrelationSurface3D height={350} />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-[#94A3B8]">
              Pearson Correlation (ρ) 90-Day Rolling Window
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-[#51CF66]" />
                <span className="text-[#94A3B8]">Diversifying (&lt; -0.3)</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-[#FF6B6B]" />
                <span className="text-[#94A3B8]">Coupled (&gt; +0.5)</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-left text-[11px] font-medium text-[#64748B] border-b border-[#273142]">
                    Asset Class
                  </th>
                  {ASSET_CLASSES.map(col => (
                    <th key={col} className="p-2 text-center text-[11px] font-medium text-[#94A3B8] border-b border-[#273142]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ASSET_CLASSES.map((rowAsset, rIdx) => (
                  <tr key={rowAsset} className="border-b border-[#273142]/40 hover:bg-[#151B26]/80 transition-colors">
                    <td className="p-2 text-left font-medium text-[#F1F3F5] text-[11px]">
                      {rowAsset}
                    </td>
                    {ASSET_CLASSES.map((colAsset, cIdx) => {
                      const corr = CORRELATION_MATRIX[rIdx][cIdx];
                      const isSelected = selectedPair?.row === rowAsset && selectedPair?.col === colAsset;

                      return (
                        <td key={colAsset} className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedPair({ row: rowAsset, col: colAsset, corr })}
                            className={cn(
                              'w-full py-1.5 px-2 rounded font-mono text-[11px] tabular-nums border transition-all',
                              getHeatmapColor(corr),
                              isSelected && 'ring-2 ring-blue-500 scale-105'
                            )}
                          >
                            {corr > 0 && corr !== 1.0 ? `+${corr.toFixed(2)}` : corr.toFixed(2)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedPair && (
            <div className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#273142] flex items-center justify-between text-xs font-mono animate-in fade-in duration-200">
              <span className="text-[#94A3B8]">
                Selected Pair: <span className="text-[#F1F3F5] font-semibold">{selectedPair.row}</span> vs{' '}
                <span className="text-[#F1F3F5] font-semibold">{selectedPair.col}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8]">Correlation:</span>
                <span className="font-bold text-cyan-400">
                  {selectedPair.corr > 0 ? `+${selectedPair.corr.toFixed(2)}` : selectedPair.corr.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
