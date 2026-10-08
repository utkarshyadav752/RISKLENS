import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import type { SeverityLevel } from '../../types/risk';
import { SEVERITY_TOKENS } from '../tokens';
import { ThreeRiskHeatmap3D } from './3d/ThreeRiskHeatmap3D';
import { Box, Layers } from 'lucide-react';

interface HeatmapCellData {
  likelihood: number; // 0-3
  impact: number; // 0-3
  count: number;
  assets: string[];
  severity: SeverityLevel;
  totalExposureM: number;
}

const HEATMAP_GRID: HeatmapCellData[] = [
  // Row 3 (Extreme Likelihood)
  { likelihood: 3, impact: 0, count: 2, assets: ['Intraday FX Noise', 'Basis Arbitrage Squeeze'], severity: 'medium', totalExposureM: 14.2 },
  { likelihood: 3, impact: 1, count: 3, assets: ['Short Gamma Drift', 'Single-Stock Earnings Jump'], severity: 'high', totalExposureM: 32.8 },
  { likelihood: 3, impact: 2, count: 2, assets: ['G10 Currency Flash Gap', 'Repo Spike Dislocation'], severity: 'critical', totalExposureM: 78.5 },
  { likelihood: 3, impact: 3, count: 1, assets: ['Global Liquidity Evaporation'], severity: 'critical', totalExposureM: 145.0 },

  // Row 2 (High Likelihood)
  { likelihood: 2, impact: 0, count: 5, assets: ['Odd-Lot Equity Fills', 'T-Bill Auction Concession'], severity: 'safe', totalExposureM: 8.5 },
  { likelihood: 2, impact: 1, count: 4, assets: ['Corporate Spread Widening', 'Commodity Backwardation Shift'], severity: 'medium', totalExposureM: 26.4 },
  { likelihood: 2, impact: 2, count: 3, assets: ['Sovereign Debt Downgrade', 'Algorithmic Execution Runaway'], severity: 'high', totalExposureM: 61.2 },
  { likelihood: 2, impact: 3, count: 1, assets: ['Prime Broker Default'], severity: 'critical', totalExposureM: 110.0 },

  // Row 1 (Medium Likelihood)
  { likelihood: 1, impact: 0, count: 8, assets: ['Overnight Gap Risk', 'Exchange Latency Jitter'], severity: 'safe', totalExposureM: 12.0 },
  { likelihood: 1, impact: 1, count: 6, assets: ['Fed +50bps Surprise', 'Crude Oil Inventory Shock'], severity: 'safe', totalExposureM: 19.8 },
  { likelihood: 1, impact: 2, count: 3, assets: ['Central Bank Currency Peg Break', 'Tier 1 Capital Downgrade'], severity: 'medium', totalExposureM: 44.1 },
  { likelihood: 1, impact: 3, count: 2, assets: ['Clearing House Margin Call Spiral', 'Systemic Cyber Event'], severity: 'high', totalExposureM: 89.0 },

  // Row 0 (Low Likelihood)
  { likelihood: 0, impact: 0, count: 12, assets: ['Routine FX Micro-Tick Variations', 'Index Rebalance Slippage'], severity: 'safe', totalExposureM: 5.2 },
  { likelihood: 0, impact: 1, count: 7, assets: ['Option Pinning at Expiry', 'Credit Spread Noise'], severity: 'safe', totalExposureM: 11.4 },
  { likelihood: 0, impact: 2, count: 4, assets: ['Major Index Delisting', 'Geopolitical Canal Blockade'], severity: 'medium', totalExposureM: 31.0 },
  { likelihood: 0, impact: 3, count: 1, assets: ['Simultaneous Multi-Market Circuit Breaker (1987 Black Monday Replay)'], severity: 'critical', totalExposureM: 215.0 }
];

const LIKELIHOOD_LABELS = ['Low (1)', 'Med (2)', 'High (3)', 'Extreme (4)'];
const IMPACT_LABELS = ['Negligible (1)', 'Moderate (2)', 'Major (3)', 'Catastrophic (4)'];

interface RiskHeatmapMatrixProps {
  defaultMode?: '3d' | '2d';
}

export const RiskHeatmapMatrix: React.FC<RiskHeatmapMatrixProps> = ({
  defaultMode = '3d'
}) => {
  const [renderMode, setRenderMode] = useState<'3d' | '2d'>(defaultMode);
  const [selectedCell, setSelectedCell] = useState<HeatmapCellData | null>(HEATMAP_GRID[2]);

  const getCellBg = (severity: SeverityLevel, isSelected: boolean) => {
    const isSel = isSelected ? 'ring-2 ring-blue-500 scale-[1.02] z-10' : '';
    switch (severity) {
      case 'critical':
        return cn('bg-[#FF6B6B]/25 text-[#FF6B6B] border border-[#FF6B6B]/60 hover:bg-[#FF6B6B]/35', isSel);
      case 'high':
        return cn('bg-[#FF922B]/20 text-[#FF922B] border border-[#FF922B]/50 hover:bg-[#FF922B]/30', isSel);
      case 'medium':
        return cn('bg-[#FCC419]/20 text-[#FCC419] border border-[#FCC419]/50 hover:bg-[#FCC419]/30', isSel);
      case 'safe':
      default:
        return cn('bg-[#51CF66]/15 text-[#51CF66] border border-[#51CF66]/40 hover:bg-[#51CF66]/25', isSel);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-3">
      {/* 3D / 2D Header Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-[#273142]/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#94A3B8]">Projection:</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
            renderMode === '3d' ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-[#1F2736] text-[#94A3B8]"
          )}>
            {renderMode === '3d' ? '3D WebGL Spatial Pillars' : '2D 4×4 Grid Matrix'}
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
        <ThreeRiskHeatmap3D height={340} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center justify-center pb-1 text-[11px] font-mono text-[#94A3B8]">
              ↑ Impact Severity (Negligible → Catastrophic)
            </div>

            <div className="flex gap-2">
              <div className="flex flex-col justify-between py-2 text-[10px] font-mono text-[#64748B] w-24 text-right">
                {IMPACT_LABELS.slice().reverse().map((lbl, idx) => (
                  <span key={idx} className="h-14 flex items-center justify-end">{lbl}</span>
                ))}
              </div>

              <div className="flex-1 grid grid-cols-4 gap-1.5">
                {[3, 2, 1, 0].map(imp => (
                  <React.Fragment key={imp}>
                    {[0, 1, 2, 3].map(lik => {
                      const cell = HEATMAP_GRID.find(c => c.impact === imp && c.likelihood === lik);
                      if (!cell) return <div key={`${imp}-${lik}`} className="bg-[#151B26] h-14 rounded-md" />;
                      const isSelected = selectedCell === cell;
                      const token = SEVERITY_TOKENS[cell.severity];

                      return (
                        <button
                          key={`${imp}-${lik}`}
                          type="button"
                          onClick={() => setSelectedCell(cell)}
                          className={cn(
                            'h-14 p-1.5 rounded-lg flex flex-col justify-between text-left transition-all relative overflow-hidden',
                            getCellBg(cell.severity, isSelected)
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-mono text-[10px]">{token.glyph}</span>
                            <span className="font-mono text-xs font-bold leading-none">{cell.count}</span>
                          </div>
                          <span className="font-mono text-[9px] truncate opacity-80">
                            ${cell.totalExposureM.toFixed(0)}M
                          </span>
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 pl-24">
              <div className="grid grid-cols-4 gap-1.5 w-full text-center text-[10px] font-mono text-[#64748B]">
                {LIKELIHOOD_LABELS.map((lbl, idx) => (
                  <span key={idx}>{lbl}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#0B0E14] p-3 rounded-xl border border-[#273142] flex flex-col justify-between">
            {selectedCell ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#273142]">
                  <div className="font-mono text-xs font-semibold text-[#F1F3F5]">
                    {IMPACT_LABELS[selectedCell.impact]} × {LIKELIHOOD_LABELS[selectedCell.likelihood]}
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase',
                    selectedCell.severity === 'critical' ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]' :
                    selectedCell.severity === 'high' ? 'bg-[#FF922B]/20 text-[#FF922B]' :
                    selectedCell.severity === 'medium' ? 'bg-[#FCC419]/20 text-[#FCC419]' :
                    'bg-[#51CF66]/20 text-[#51CF66]'
                  )}>
                    {selectedCell.severity}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-[#94A3B8]">Monitored Assets:</div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {selectedCell.assets.map((asset, idx) => (
                      <div key={idx} className="text-xs font-mono text-[#F1F3F5] bg-[#151B26] p-1.5 rounded border border-[#273142]/60 truncate">
                        • {asset}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#273142] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#94A3B8]">Combined Exposure:</span>
                  <span className="font-bold text-[#F1F3F5]">${selectedCell.totalExposureM.toFixed(1)}M</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[#64748B] font-mono text-center">
                Click any cell to inspect assets
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
