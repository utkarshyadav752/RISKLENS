import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { DrawerModal } from '../shell/DrawerModal';
import { ToggleSwitch } from '../controls/ToggleSwitch';

const WIDGET_CATALOG = [
  { id: 'var_gauge', name: 'Value at Risk (VaR) Semi-Circular Gauge', category: 'Risk Engines' },
  { id: 'risk_matrix', name: '4x4 Risk Likelihood vs. Impact Heatmap', category: 'Risk Engines' },
  { id: 'capital_adequacy', name: 'Tier 1 Capital Adequacy & Solvency II', category: 'Executive CRO' },
  { id: 'monte_carlo', name: '100k Monte Carlo Distribution Histogram', category: 'Quantitative' },
  { id: 'correlation_surface', name: 'Cross-Asset Correlation Matrix', category: 'Quantitative' },
  { id: 'portfolio_greeks', name: 'Portfolio Greeks & Volatility Sensitivity', category: 'Quantitative' },
  { id: 'breach_queue', name: 'Active Regulatory Breach SLA Queue', category: 'Compliance' },
  { id: 'audit_timeline', name: 'Cryptographic SHA-256 Audit Trail', category: 'Compliance' },
  { id: 'desk_telemetry', name: 'Sub-Second Desk Execution Telemetry', category: 'Trading Ops' },
  { id: 'circuit_breaker', name: 'Emergency Algorithmic Circuit Breaker', category: 'Trading Ops' },
  { id: 'waterfall_exposure', name: 'Factor Waterfall Exposure Attribution', category: 'Risk Engines' },
  { id: 'geo_risk_map', name: 'Global Counterparty Geographic Exposure', category: 'Risk Engines' }
];

export const WidgetCustomizerDrawer: React.FC = () => {
  const { widgetCustomizerOpen, setWidgetCustomizerOpen, widgetVisibility, toggleWidget } = useDashboard();

  return (
    <DrawerModal
      isOpen={widgetCustomizerOpen}
      onClose={() => setWidgetCustomizerOpen(false)}
      title="Customize Dashboard Cards"
      subtitle="Configure visible telemetries for your personalized workspace."
      width="md"
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Toggle telemetry modules to streamline your cognitive load. Changes persist in your active session.
        </p>

        <div className="space-y-3">
          {WIDGET_CATALOG.map(widget => {
            const isVisible = widgetVisibility[widget.id] ?? true;
            return (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#0B0E14] border border-[#273142] hover:border-[#3B82F6]/40 transition-colors"
              >
                <div className="flex flex-col pr-3">
                  <span className="text-xs font-semibold text-[#F1F3F5]">
                    {widget.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B] mt-0.5">
                    {widget.category}
                  </span>
                </div>

                <ToggleSwitch
                  checked={isVisible}
                  onChange={() => toggleWidget(widget.id)}
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      </div>
    </DrawerModal>
  );
};
