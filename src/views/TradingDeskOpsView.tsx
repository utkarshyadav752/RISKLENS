import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { WidgetCard } from '../design-system/shell/WidgetCard';
import { MetricCallout } from '../design-system/primitives/MetricCallout';
import { CircuitBreakerButton } from '../design-system/controls/CircuitBreakerButton';
import { LimitUsageBar } from '../design-system/visualizations/LimitUsageBar';
import { RiskBadge } from '../design-system/primitives/RiskBadge';
import { TableCellMono } from '../design-system/tables/TableCellMono';
import { Button } from '../design-system/primitives/Button';
import { ThreeDesksHologram3D } from '../design-system/visualizations/3d/ThreeDesksHologram3D';
import { Activity, Zap, ShieldAlert, Pause, Play, AlertOctagon } from 'lucide-react';
import { cn } from '../utils/cn';

export const TradingDeskOpsView: React.FC = () => {
  const {
    tradingDesks,
    freezeDesk,
    unfreezeDesk,
    isCircuitBreakerTripped,
    tripCircuitBreaker,
    resetCircuitBreaker,
    isSimulationMode,
    liveSocketLatencyMs
  } = useDashboard();

  const totalActiveOrders = tradingDesks.reduce((acc, d) => acc + d.activeOrders, 0);
  const totalMarginAllocated = tradingDesks.reduce((acc, d) => acc + d.allocatedMarginUsd, 0);
  const avgSlippage = (tradingDesks.reduce((acc, d) => acc + d.slippageBps, 0) / tradingDesks.length).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Ops Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[#151B26] border border-[#273142]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center font-mono text-amber-400 font-bold text-base">
            LO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#F1F3F5]">
                Liam O&apos;Connor
              </h1>
              <span className="text-xs text-[#94A3B8] font-mono">· Trading Floor Operations Lead</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5 font-mono">
              High-Frequency Algorithmic Desks, Order Execution Routing &amp; Circuit Breakers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0E14] border border-[#273142] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#51CF66] animate-ping" />
            <span className="text-[#94A3B8]">Fix Feed: </span>
            <span className="text-[#51CF66] font-semibold">{liveSocketLatencyMs}ms</span>
          </div>
        </div>
      </div>

      {/* Emergency Freeze Circuit Breaker Banner Control */}
      <WidgetCard
        title="Algorithmic Desk Emergency Isolation Control"
        subtitle="Two-step slide-to-confirm fail-safe to immediately halt runaway algorithmic executions"
        className="border-red-500/30"
      >
        <CircuitBreakerButton
          isTripped={isCircuitBreakerTripped}
          onTrip={() => tripCircuitBreaker()}
          onReset={resetCircuitBreaker}
          deskName="All 5 Algorithmic Desks"
        />
      </WidgetCard>

      {/* Real-Time Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCallout
          title="Active Live Orders"
          value={totalActiveOrders.toLocaleString()}
          benchmark="50k Cap"
          deltaPercent={6.4}
          deltaDirection="up"
          severity="safe"
          sparklineData={[28000, 29500, 31000, 31490]}
          subtitle="Routing Across 14 Venues"
        />

        <MetricCallout
          title="Avg Execution Slippage"
          value={isSimulationMode ? '18.2' : avgSlippage}
          unit="bps"
          benchmark="8.0 bps Norm"
          deltaPercent={isSimulationMode ? 142 : 12.5}
          deltaDirection="up"
          severity={isSimulationMode ? 'critical' : 'high'}
          sparklineData={isSimulationMode ? [8.2, 9.4, 12.1, 15.6, 18.2] : [7.2, 7.8, 8.1, 8.4]}
          subtitle="VWAP Benchmark Slippage"
        />

        <MetricCallout
          title="Intraday Margin Committed"
          value={`$${(totalMarginAllocated / 1000000).toFixed(1)}`}
          unit="M"
          benchmark="$895.0M Cap"
          deltaPercent={4.8}
          deltaDirection="up"
          severity="medium"
          sparklineData={[580, 592, 600, 602.9]}
          subtitle="Firmwide Margin Capacity"
        />

        <MetricCallout
          title="Execution Anomaly Score"
          value={isSimulationMode ? '0.89' : '0.12'}
          benchmark="< 0.30 Nominal"
          deltaPercent={isSimulationMode ? 280 : -5.0}
          deltaDirection={isSimulationMode ? 'up' : 'down'}
          severity={isSimulationMode ? 'critical' : 'safe'}
          sparklineData={isSimulationMode ? [0.15, 0.28, 0.54, 0.89] : [0.14, 0.13, 0.12]}
          subtitle="ZeTheta Neural Anomaly Detector"
        />
      </div>

      {/* 3D Holographic Trading Floor Telemetry Towers */}
      <WidgetCard
        title="3D Holographic Algorithmic Floor Telemetry"
        subtitle="Real-time margin towers with reactive dynamic containment forcefields"
      >
        <ThreeDesksHologram3D height={340} />
      </WidgetCard>

      {/* Desk Status & Margin Proximity Table */}
      <WidgetCard
        title="Trading Desk Intraday Margin & Execution Proximity"
        subtitle="Individual desk telemetry, slippage tracking, and single-desk kill switches"
      >
        <div className="overflow-x-auto rounded-lg border border-[#273142] bg-[#0B0E14]">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[#273142] bg-[#151B26] text-[11px] text-[#64748B]">
                <th className="p-2.5 text-left">Trading Desk</th>
                <th className="p-2.5 text-left">Strategy</th>
                <th className="p-2.5 text-right">Active Orders</th>
                <th className="p-2.5 text-left w-48">Margin Utilization</th>
                <th className="p-2.5 text-right">Intraday P&amp;L</th>
                <th className="p-2.5 text-right">Slippage</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-right">Desk Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273142]/40">
              {tradingDesks.map(desk => {
                const isFrozen = desk.status === 'frozen' || isCircuitBreakerTripped;

                return (
                  <tr key={desk.id} className={cn('hover:bg-[#151B26]', isFrozen && 'bg-red-950/20')}>
                    <td className="p-2.5 text-[#F1F3F5] font-semibold">
                      {desk.name}
                    </td>
                    <td className="p-2.5 text-[#94A3B8] text-[11px]">
                      {desk.strategy}
                    </td>
                    <td className="p-2.5 text-right tabular-nums text-[#F1F3F5]">
                      {desk.activeOrders.toLocaleString()}
                    </td>
                    <td className="p-2.5">
                      <LimitUsageBar
                        current={desk.allocatedMarginUsd / 1000000}
                        max={desk.maxMarginUsd / 1000000}
                        unit="$M"
                        showLabels={false}
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      <TableCellMono
                        value={desk.intradayPnlUsd}
                        format="currency"
                        colorizeDelta
                        deltaDirection={desk.intradayPnlUsd >= 0 ? 'down' : 'up'}
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      <span className={cn('font-semibold tabular-nums', desk.slippageBps > 12 ? 'text-[#FF6B6B]' : desk.slippageBps > 8 ? 'text-[#FF922B]' : 'text-[#51CF66]')}>
                        {desk.slippageBps.toFixed(1)} bps
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      {isFrozen ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/30 text-red-300 border border-red-500/50 uppercase">
                          HALTED
                        </span>
                      ) : desk.status === 'warning' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF922B]/20 text-[#FF922B] border border-[#FF922B]/40 uppercase">
                          ELEVATED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#51CF66]/20 text-[#51CF66] border border-[#51CF66]/40 uppercase">
                          NOMINAL
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-right">
                      {isFrozen ? (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Play size={11} className="text-[#51CF66]" />}
                          onClick={() => unfreezeDesk(desk.id)}
                        >
                          Resume
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<Pause size={11} />}
                          onClick={() => freezeDesk(desk.id)}
                        >
                          Freeze
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </WidgetCard>
    </div>
  );
};
