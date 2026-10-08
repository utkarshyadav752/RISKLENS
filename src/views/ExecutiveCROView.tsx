import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { WidgetCard } from '../design-system/shell/WidgetCard';
import { MetricCallout } from '../design-system/primitives/MetricCallout';
import { VaRGauge } from '../design-system/visualizations/VaRGauge';
import { RiskHeatmapMatrix } from '../design-system/visualizations/RiskHeatmapMatrix';
import { GeoRiskMap } from '../design-system/visualizations/GeoRiskMap';
import { ThreeRiskGlobe3D } from '../design-system/visualizations/3d/ThreeRiskGlobe3D';
import { ThreeRiskTerrain3D } from '../design-system/visualizations/3d/ThreeRiskTerrain3D';
import { WaterfallExposureChart } from '../design-system/visualizations/WaterfallExposureChart';
import { ScenarioComparisonCard } from '../design-system/workflows/ScenarioComparisonCard';
import { LimitUsageBar } from '../design-system/visualizations/LimitUsageBar';
import { RiskBadge } from '../design-system/primitives/RiskBadge';
import { Button } from '../design-system/primitives/Button';
import { FileText, ShieldAlert, Award, Globe, Map } from 'lucide-react';
import { cn } from '../utils/cn';

export const ExecutiveCROView: React.FC = () => {
  const { widgetVisibility, isSimulationMode, showToast, breaches } = useDashboard();
  const [geoMode, setGeoMode] = useState<'3d' | '2d'>('3d');

  const criticalCount = breaches.filter(b => b.severity === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Key Directive Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#151B26] border border-[#273142]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-mono text-blue-400 font-bold text-lg">
            EV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#F1F3F5]">
                Elena Vance
              </h1>
              <span className="text-xs text-[#94A3B8] font-mono">· Chief Risk Officer</span>
              <RiskBadge severity={criticalCount > 0 ? 'critical' : 'safe'} size="sm" />
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 font-mono">
              Executive Capital Governance &amp; Board Risk Appetite Committee (Q4 Active Mandate)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FileText size={14} />}
            onClick={() => showToast('Board Report Generated', 'Exported Q4 Solvency & Capital Sufficiency Dossier (PDF).', 'safe')}
          >
            1-Click Board PDF
          </Button>
        </div>
      </div>

      {/* Top 4 Macro Capital KPI Metric Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCallout
          title="Enterprise Capital at Risk"
          value={isSimulationMode ? '$68.4' : '$42.8'}
          unit="M"
          benchmark="$50.0M"
          deltaPercent={isSimulationMode ? 59.8 : 3.4}
          deltaDirection={isSimulationMode ? 'up' : 'down'}
          severity={isSimulationMode ? 'critical' : 'safe'}
          sparklineData={isSimulationMode ? [42, 44, 46, 52, 58, 64, 68] : [45, 44, 43, 44, 42, 43, 42]}
          subtitle="99.0% 1-Day Parametric"
        />

        <MetricCallout
          title="Tier 1 Capital Adequacy (CET1)"
          value={isSimulationMode ? '11.2%' : '14.8%'}
          benchmark="11.5% Floor"
          deltaPercent={isSimulationMode ? -24.3 : 1.2}
          deltaDirection={isSimulationMode ? 'down' : 'up'}
          severity={isSimulationMode ? 'high' : 'safe'}
          sparklineData={isSimulationMode ? [15.2, 14.8, 14.0, 13.2, 12.1, 11.2] : [14.2, 14.4, 14.5, 14.6, 14.8]}
          subtitle="PRA Baseline Minimum"
        />

        <MetricCallout
          title="Solvency II Capital Buffer"
          value={isSimulationMode ? '128%' : '182%'}
          benchmark="140% Target"
          deltaPercent={isSimulationMode ? -29.6 : 4.5}
          deltaDirection={isSimulationMode ? 'down' : 'up'}
          severity={isSimulationMode ? 'high' : 'safe'}
          sparklineData={isSimulationMode ? [182, 175, 160, 145, 128] : [174, 178, 180, 182]}
          subtitle="SCR Ratio Buffer"
        />

        <MetricCallout
          title="Liquidity Coverage Ratio (LCR)"
          value={isSimulationMode ? '118%' : '164%'}
          benchmark="100% Statutory"
          deltaPercent={isSimulationMode ? -28.0 : 2.1}
          deltaDirection={isSimulationMode ? 'down' : 'up'}
          severity={isSimulationMode ? 'medium' : 'safe'}
          sparklineData={isSimulationMode ? [164, 155, 142, 130, 118] : [160, 161, 163, 164]}
          subtitle="30-Day Stress Net Outflow"
        />
      </div>

      {/* Row 2: VaR Semi-Circle Gauge + 4x4 Heatmap Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {widgetVisibility.var_gauge && (
          <div className="lg:col-span-4">
            <WidgetCard
              title="Value at Risk (VaR) Engine"
              subtitle="Current Exposure vs. Board Ceilings"
              footerStatus={
                <>
                  <span>Board Cap: $50.0M</span>
                  <span className="text-[#51CF66]">Confidence: 99.0%</span>
                </>
              }
            >
              <VaRGauge />
            </WidgetCard>
          </div>
        )}

        {widgetVisibility.risk_matrix && (
          <div className="lg:col-span-8">
            <WidgetCard
              title="Enterprise Risk Heatmap (4×4 Likelihood vs. Impact)"
              subtitle="Asset clusters mapped to risk governance quadrants"
              footerStatus={
                <>
                  <span>Total Monitored Nodes: 54</span>
                  <span>Active Model: ZeTheta Multi-Factor V3</span>
                </>
              }
            >
              <RiskHeatmapMatrix />
            </WidgetCard>
          </div>
        )}
      </div>

      {/* Row 3: Factor Exposure Waterfall + Geographic Risk Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {widgetVisibility.waterfall_exposure && (
          <div className="lg:col-span-5">
            <WidgetCard
              title="Factor Exposure Attribution"
              subtitle="Notional allocation across core market risk factors"
            >
              <WaterfallExposureChart />
            </WidgetCard>
          </div>
        )}

        {widgetVisibility.geo_risk_map && (
          <div className="lg:col-span-7">
            <WidgetCard
              title="Global Counterparty Geographic Exposure"
              subtitle="Regional settlement concentrations & Basel III risk weights"
              headerAction={
                <div className="flex items-center bg-[#0B0E14] p-0.5 rounded-lg border border-[#273142] text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setGeoMode('3d')}
                    className={cn(
                      'px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-colors',
                      geoMode === '3d' ? 'bg-[#1F2736] text-blue-400' : 'text-[#94A3B8] hover:text-[#F1F3F5]'
                    )}
                  >
                    <Globe size={11} /> 3D Globe
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeoMode('2d')}
                    className={cn(
                      'px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-colors',
                      geoMode === '2d' ? 'bg-[#1F2736] text-blue-400' : 'text-[#94A3B8] hover:text-[#F1F3F5]'
                    )}
                  >
                    <Map size={11} /> 2D Map
                  </button>
                </div>
              }
            >
              {geoMode === '3d' ? <ThreeRiskGlobe3D height={320} /> : <GeoRiskMap />}
            </WidgetCard>
          </div>
        )}
      </div>

      {/* Row 4: 3D Parametric Risk Terrain + Stress Scenario Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <WidgetCard
            title="3D Parametric Loss Manifold & Volatility Surface"
            subtitle="Interactive Three.js WebGL terrain with real-time shockwave deformation"
          >
            <ThreeRiskTerrain3D height={320} />
          </WidgetCard>
        </div>

        <div className="lg:col-span-6">
          <ScenarioComparisonCard />
        </div>
      </div>
    </div>
  );
};
