import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { WidgetCard } from '../design-system/shell/WidgetCard';
import { MetricCallout } from '../design-system/primitives/MetricCallout';
import { DistributionHistogram } from '../design-system/visualizations/DistributionHistogram';
import { ThreeMonteCarlo3D } from '../design-system/visualizations/3d/ThreeMonteCarlo3D';
import { ThreeRiskTerrain3D } from '../design-system/visualizations/3d/ThreeRiskTerrain3D';
import { CorrelationSurface } from '../design-system/visualizations/CorrelationSurface';
import { TableCellMono } from '../design-system/tables/TableCellMono';
import { Button } from '../design-system/primitives/Button';
import { Database, Download, Sparkles, TrendingUp, Layers, BarChart2, Box } from 'lucide-react';
import { cn } from '../utils/cn';
import type { GreeksAttribution } from '../types/risk';

const GREEKS_DATA: GreeksAttribution[] = [
  { assetClass: 'Equities (US Tech & Small Cap)', deltaUsd: 142500000, gammaUsd: 2840000, vegaUsd: 1250000, thetaUsdPerDay: -48000, rhoUsd: 310000 },
  { assetClass: 'FX (G10 Cross-Currencies)', deltaUsd: 89400000, gammaUsd: 1120000, vegaUsd: 890000, thetaUsdPerDay: -24000, rhoUsd: 185000 },
  { assetClass: 'Fixed Income (2Y/5Y/10Y Treasuries)', deltaUsd: -45200000, gammaUsd: 640000, vegaUsd: 340000, thetaUsdPerDay: -12000, rhoUsd: 1840000 },
  { assetClass: 'Commodities (Crude, Gold, Copper)', deltaUsd: 32100000, gammaUsd: 480000, vegaUsd: 410000, thetaUsdPerDay: -8500, rhoUsd: 74000 },
  { assetClass: 'Digital Assets (BTC & ETH CME Options)', deltaUsd: 18700000, gammaUsd: 3890000, vegaUsd: 1980000, thetaUsdPerDay: -92000, rhoUsd: 42000 }
];

export const QuantAnalystView: React.FC = () => {
  const { widgetVisibility, isSimulationMode, showToast } = useDashboard();
  const [mcViewMode, setMcViewMode] = useState<'3d' | '2d'>('3d');

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[#151B26] border border-[#273142]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center font-mono text-purple-400 font-bold text-base">
            MC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#F1F3F5]">
                Marcus Chen
              </h1>
              <span className="text-xs text-[#94A3B8] font-mono">· Senior Quantitative Analyst</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5 font-mono">
              Model Risk, Stochastic Volatility &amp; High-Dimension Monte Carlo Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Database size={13} className="text-purple-400" />}
            onClick={() => showToast('Parquet Export Generated', '100k simulation path tensors exported to Apache Parquet.', 'safe')}
          >
            Export Parquet
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download size={13} />}
            onClick={() => showToast('Greeks Exported', 'Sensitivities matrix exported to CSV.', 'info')}
          >
            CSV Matrix
          </Button>
        </div>
      </div>

      {/* Quant Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCallout
          title="Parametric 99% VaR (1-Day)"
          value={isSimulationMode ? '$68.4' : '$48.65'}
          unit="M"
          benchmark="$45.0M"
          deltaPercent={isSimulationMode ? 52.4 : 4.2}
          deltaDirection="up"
          severity={isSimulationMode ? 'critical' : 'high'}
          sparklineData={isSimulationMode ? [45, 48, 54, 62, 68] : [44, 46, 47, 48, 48.6]}
          subtitle="GARCH(1,1) Volatility Forecast"
        />

        <MetricCallout
          title="Expected Shortfall (ES / CVaR)"
          value={isSimulationMode ? '$88.2' : '$62.10'}
          unit="M"
          benchmark="$55.0M"
          deltaPercent={isSimulationMode ? 62.1 : 8.1}
          deltaDirection="up"
          severity="critical"
          sparklineData={isSimulationMode ? [58, 64, 72, 81, 88] : [55, 57, 59, 61, 62.1]}
          subtitle="Fat-Tail Student-t (ν = 4.2)"
        />

        <MetricCallout
          title="Portfolio Total Vega"
          value={isSimulationMode ? '$4.87' : '$4.87'}
          unit="M / 1% vol"
          benchmark="$5.50M"
          deltaPercent={-1.5}
          deltaDirection="down"
          severity="safe"
          sparklineData={[4.9, 4.88, 4.86, 4.87]}
          subtitle="Net Volatility Sensitivity"
        />

        <MetricCallout
          title="Tail Index (Hill Estimator α)"
          value={isSimulationMode ? '2.14' : '3.42'}
          benchmark="> 3.0 Normal"
          deltaPercent={isSimulationMode ? -37.4 : -2.1}
          deltaDirection={isSimulationMode ? 'up' : 'neutral'}
          severity={isSimulationMode ? 'critical' : 'safe'}
          sparklineData={isSimulationMode ? [3.5, 3.2, 2.8, 2.4, 2.14] : [3.45, 3.44, 3.42]}
          subtitle="Extreme Value Fréchet Dispersion"
        />
      </div>

      {/* Row 2: Monte Carlo 100k Distribution (2D Histogram / 3D Phase Space) */}
      {widgetVisibility.monte_carlo && (
        <WidgetCard
          title="Monte Carlo Empirical Loss Distribution (100,000 Iterations)"
          subtitle="Stochastic Heston Volatility Engine with Full Factor Covariance"
          headerAction={
            <div className="flex items-center bg-[#0B0E14] p-0.5 rounded-lg border border-[#273142] text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setMcViewMode('3d')}
                className={cn(
                  'px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-colors',
                  mcViewMode === '3d' ? 'bg-[#1F2736] text-purple-400' : 'text-[#94A3B8] hover:text-[#F1F3F5]'
                )}
              >
                <Layers size={11} /> 3D Phase Cloud
              </button>
              <button
                type="button"
                onClick={() => setMcViewMode('2d')}
                className={cn(
                  'px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-colors',
                  mcViewMode === '2d' ? 'bg-[#1F2736] text-purple-400' : 'text-[#94A3B8] hover:text-[#F1F3F5]'
                )}
              >
                <BarChart2 size={11} /> 2D Histogram
              </button>
            </div>
          }
          footerStatus={
            <>
              <span>Random Seed: 0x7F9B2C4E · Latency: 142ms</span>
              <span className="text-[#4DABF7]">Engine: ZeTheta CUDA Monte Carlo Kernel</span>
            </>
          }
        >
          {mcViewMode === '3d' ? (
            <ThreeMonteCarlo3D height={340} />
          ) : (
            <DistributionHistogram />
          )}
        </WidgetCard>
      )}

      {/* Row 3: 3D Volatility Terrain & Correlation Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <WidgetCard
            title="3D Local Volatility Surface ($σ_{LV}$)"
            subtitle="Heston-Dupire Calibration with Smile & Tail Inversion"
          >
            <ThreeRiskTerrain3D height={320} />
          </WidgetCard>
        </div>

        {widgetVisibility.correlation_surface && (
          <div className="lg:col-span-6">
            <WidgetCard
              title="Cross-Asset Rolling Correlation Surface"
              subtitle="Pairwise Pearson coefficients with 90-day exponential decay"
            >
              <CorrelationSurface />
            </WidgetCard>
          </div>
        )}
      </div>

      {/* Row 4: Portfolio Greeks & Factor Sensitivities */}
      {widgetVisibility.portfolio_greeks && (
        <WidgetCard
          title="Portfolio Greeks & Factor Sensitivities"
          subtitle="Analytical Black-Scholes & Local Volatility Derivatives"
        >
          <div className="overflow-x-auto rounded-lg border border-[#273142] bg-[#0B0E14]">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[#273142] bg-[#1F2736]/70 text-[#64748B] text-[11px]">
                  <th className="p-2 text-left">Asset Class</th>
                  <th className="p-2 text-right">Delta ($)</th>
                  <th className="p-2 text-right">Gamma ($)</th>
                  <th className="p-2 text-right">Vega ($)</th>
                  <th className="p-2 text-right">Theta/Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#273142]/40">
                {GREEKS_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#151B26]">
                    <td className="p-2 text-[#F1F3F5] text-[11px] truncate max-w-[140px]">
                      {row.assetClass}
                    </td>
                    <td className="p-2 text-right">
                      <TableCellMono value={row.deltaUsd} format="currency" />
                    </td>
                    <td className="p-2 text-right">
                      <TableCellMono value={row.gammaUsd} format="currency" />
                    </td>
                    <td className="p-2 text-right">
                      <TableCellMono value={row.vegaUsd} format="currency" />
                    </td>
                    <td className="p-2 text-right">
                      <span className="text-[#FF6B6B] tabular-nums">
                        -${Math.abs(row.thetaUsdPerDay / 1000).toFixed(1)}k
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WidgetCard>
      )}
    </div>
  );
};
