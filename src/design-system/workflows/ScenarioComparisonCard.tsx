import React, { useState } from 'react';
import { ArrowRight, Flame, BarChart2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ScenarioComparisonCardProps {
  className?: string;
}

interface ScenarioMetric {
  name: string;
  baseVal: string;
  stressedVal: string;
  delta: string;
  deltaDirection: 'up' | 'down';
}

const SCENARIOS = [
  {
    id: 'fed100',
    title: 'Fed Rate Hike (+100 bps) & Curve Inversion',
    description: 'Immediate upward parallel shift in SOFR curve accompanied by 2s10s yield inversion.',
    metrics: [
      { name: 'Portfolio 99% VaR', baseVal: '$42.8M', stressedVal: '$68.4M', delta: '+59.8%', deltaDirection: 'up' },
      { name: 'Tier 1 Capital Adequacy', baseVal: '14.8%', stressedVal: '11.2%', delta: '-24.3%', deltaDirection: 'down' },
      { name: 'Rates Desk Intraday Margin', baseVal: '$203.3M', stressedVal: '$318.5M', delta: '+56.6%', deltaDirection: 'up' },
      { name: 'Liquidity Buffer Runoff', baseVal: '$850M', stressedVal: '$610M', delta: '-28.2%', deltaDirection: 'down' }
    ] as ScenarioMetric[]
  },
  {
    id: 'lehman08',
    title: '2008 Lehman Systemic Counterparty Shock',
    description: 'Spike in CDS spreads (+350bps), interbank freeze, and fire-sale asset liquidations.',
    metrics: [
      { name: 'Portfolio 99% VaR', baseVal: '$42.8M', stressedVal: '$94.2M', delta: '+120.1%', deltaDirection: 'up' },
      { name: 'Tier 1 Capital Adequacy', baseVal: '14.8%', stressedVal: '9.4%', delta: '-36.5%', deltaDirection: 'down' },
      { name: 'High Yield Default Losses', baseVal: '$4.2M', stressedVal: '$38.1M', delta: '+807%', deltaDirection: 'up' },
      { name: 'Unencumbered Collateral', baseVal: '$1.2B', stressedVal: '$640M', delta: '-46.7%', deltaDirection: 'down' }
    ] as ScenarioMetric[]
  },
  {
    id: 'march20',
    title: 'March 2020 COVID Liquidity Evaporation',
    description: 'Treasury off-the-run basis blowup, VIX spike to 82, cross-currency basis dislocation.',
    metrics: [
      { name: 'Portfolio 99% VaR', baseVal: '$42.8M', stressedVal: '$79.6M', delta: '+86.0%', deltaDirection: 'up' },
      { name: 'FX Execution Slippage', baseVal: '11.2 bps', stressedVal: '44.8 bps', delta: '+300%', deltaDirection: 'up' },
      { name: 'Prime Broker Margin Calls', baseVal: '$18.5M', stressedVal: '$112.0M', delta: '+505%', deltaDirection: 'up' },
      { name: 'Expected Shortfall (ES 99)', baseVal: '$54.0M', stressedVal: '$104.2M', delta: '+93.0%', deltaDirection: 'up' }
    ] as ScenarioMetric[]
  }
];

export const ScenarioComparisonCard: React.FC<ScenarioComparisonCardProps> = ({ className }) => {
  const [activeScenarioId, setActiveScenarioId] = useState('fed100');
  const scenario = SCENARIOS.find(s => s.id === activeScenarioId)!;

  return (
    <div className={cn('p-4 rounded-xl border bg-[#151B26] border-[#273142] flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-[#FF922B]" />
          <h3 className="text-xs font-semibold text-[#F1F3F5]">
            Macro Stress Test Comparison
          </h3>
        </div>

        {/* Scenario Selector Pills */}
        <div className="flex items-center gap-1 bg-[#0B0E14] p-0.5 rounded-lg border border-[#273142]">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveScenarioId(s.id)}
              className={cn(
                'px-2 py-1 text-[11px] font-mono rounded font-medium transition-colors',
                activeScenarioId === s.id
                  ? 'bg-[#1F2736] text-[#F1F3F5] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F1F3F5]'
              )}
            >
              {s.id === 'fed100' ? 'Fed +100bps' : s.id === 'lehman08' ? 'Lehman \'08' : 'COVID \'20'}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-[#94A3B8] font-mono leading-relaxed">
        {scenario.description}
      </p>

      {/* Side-by-side Metric Comparison Table */}
      <div className="border border-[#273142] rounded-lg overflow-hidden bg-[#0B0E14]">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-[#273142] bg-[#1F2736]/60 text-[11px] text-[#64748B]">
              <th className="p-2 text-left font-medium">Metric</th>
              <th className="p-2 text-right font-medium">Base Case</th>
              <th className="p-2 text-right font-medium">Stressed</th>
              <th className="p-2 text-right font-medium">Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#273142]/40">
            {scenario.metrics.map((m, idx) => (
              <tr key={idx} className="hover:bg-[#151B26]">
                <td className="p-2 text-[#F1F3F5] font-medium text-[11px]">{m.name}</td>
                <td className="p-2 text-right text-[#94A3B8] tabular-nums">{m.baseVal}</td>
                <td className="p-2 text-right text-[#F1F3F5] font-semibold tabular-nums">{m.stressedVal}</td>
                <td className="p-2 text-right text-[#FF6B6B] font-semibold tabular-nums">
                  {m.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
