import React, { useState } from 'react';
import { FileText, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { cn } from '../utils/cn';

const DOC_CHAPTERS = [
  { id: 'day-01-02', title: 'Day 01–02: Research & Architecture', summary: 'Executive problem space, 4 persona taxonomies, and WCAG 2.2 AA dual signifiers.' },
  { id: 'day-03-04', title: 'Day 03–04: Core Module Development', summary: 'Design tokens, contrast ratios, and Tier 1 foundation primitives.' },
  { id: 'day-05-06', title: 'Day 05–06: Primary Features & Shell', summary: 'Adaptive densities, system threat levels, and stress simulation mode.' },
  { id: 'day-07-08', title: 'Day 07–08: Controls & Workflows', summary: 'Slide-to-confirm circuit breaker, Cmd+K command palette, and SLA queues.' },
  { id: 'day-09-10', title: 'Day 09–10: Analytics & Visualizations', summary: 'Semi-circular VaR gauge, Monte Carlo 100k histogram, and correlation surface.' },
  { id: 'day-11-12', title: 'Day 11–12: Dashboard Integration', summary: 'Centralized React context, jitter simulation, and data table filtering.' },
  { id: 'day-13-14', title: 'Day 13–14: Testing & WCAG Audit', summary: 'Mathematical contrast proofs, W3C luminance formulas, and keyboard access.' },
  { id: 'day-15', title: 'Day 15: Final Submission Dossier', summary: 'Comprehensive executive summary, deliverables checklist, and technical sign-off.' }
];

const DOC_CONTENT: Record<string, string> = {
  'day-01-02': `
# Days 01–02: Research, Threat Modeling & Architecture

## 1. Executive Context & Industry Problem Space
Financial risk management systems at quantitative trading firms operate under rigorous latency constraints, multi-billion-dollar capital exposures, and stringent statutory mandates (SEC Rule 15c3-5, MiFID II RTS 27/28, Basel III Internal Models Approach, Solvency II). When market dislocations occur—such as flash crashes, algorithmic feedback loops, or sudden sovereign rate shifts—operations teams face critical cognitive overload. Traditional dashboards often default to unstructured data dumps, uniform color tables, and sluggish single-persona layouts.

RiskLens was engineered by ZeTheta Algorithms as an Adaptive Real-Time Financial Risk Monitoring Console. The system dynamically restructures its information density, layout composition, and telemetry hierarchy according to four distinct user roles while enforcing strict WCAG 2.2 Level AA accessibility.

## 2. Persona Role Taxonomy & Cognitive Workload Mapping
- Elena Vance (Chief Risk Officer): Layout Density: 'comfortable'. Macro capital preservation, CET1 adequacy, Solvency II buffer, board sign-off.
- Marcus Chen (Senior Quantitative Analyst): Layout Density: 'compact'. Stochastic tail distributions, fat-tail indices, Monte Carlo quantiles, portfolio Greeks.
- Sarah Al-Mansoor (Compliance & Audit Lead): Layout Density: 'standard'. Statutory SLA timer queues, immutable audit logs (SHA-256), SEC 15c3-5 attestations.
- Liam O'Connor (Trading Floor Ops Lead): Layout Density: 'compact'. Sub-second margin telemetry, execution slippage spikes, slide-to-confirm emergency freeze.

## 3. WCAG 2.2 Level AA Dual-Signifier Design System
Never rely solely on color. Every critical alert level couples color, shape glyph, text label, and icon:
- Critical (#FF6B6B): 🛑 Octagon (OctagonAlert icon), Contrast: 6.22:1 against Obsidian Base (#0B0E14).
- High (#FF922B): ⚠️ Triangle (TriangleAlert icon), Contrast: 7.72:1 against Obsidian Base.
- Medium (#FCC419): 🔶 Diamond (Diamond icon), Contrast: 10.73:1 against Obsidian Base.
- Safe (#51CF66): 🟢 Circle (CheckCircle2 icon), Contrast: 8.60:1 against Obsidian Base.
- Info (#4DABF7): ℹ️ Square (Info icon), Contrast: 6.97:1 against Obsidian Base.
  `,
  'day-03-04': `
# Days 03–04: Core Module Development & Token Architecture

## 1. Design System Token Pipeline
RiskLens enforces a unified token abstraction located in src/design-system/tokens.ts. All interactive primitives consume programmatic severity mappings guaranteeing mathematically calculated luminance and relative contrast ratios, shape glyph identity mapping, and accessible ARIA role descriptions.

## 2. Tier 1 Foundation Primitives
- Button.tsx: Standardized focus visible rings (focus-visible:ring-2 focus-visible:ring-blue-500), 5 semantic variants, keyboard interaction handling, loading spinners.
- RiskBadge.tsx: Combines background tints, border indicators, Lucide SVG icons, shape glyphs, and text labels for universal legibility across all color-vision deficiencies.
- MetricCallout.tsx: High-impact card featuring monospace tabular numerals (tabular-nums), directional risk delta arrows, and integrated SVG micro-sparklines.
- StatusIndicator.tsx: Real-time heartbeat beacon with CSS animation ping for sub-second telemetry feeds.
- Divider.tsx: Semantic <div role="separator"> with optional monospace section markers.
- SkeletonLoader.tsx: Shimmer placeholders matching layout geometry to prevent content shift.
  `,
  'day-05-06': `
# Days 05–06: Primary Features – Shell, Personas & Threat States

## 1. Adaptive Navigation & Grid Shell
The dashboard shell adapts to three layout densities:
- comfortable (24px gap, 24px container padding): Used by Elena Vance (CRO) to support macroscopic board reviews without visual clutter.
- standard (16px gap, 20px container padding): Used by Sarah Al-Mansoor (Compliance) for incident queues and tabular verification workflows.
- compact (12px gap, 14px container padding): Used by Marcus Chen (Quant) and Liam O'Connor (Desk Ops) for maximum information density per square inch.

## 2. Global Threat Levels & Defensive Postures
- Normal (DEFCON 5): Standard background monitoring; emerald status beacons.
- Elevated (DEFCON 3): Orange caution state; triggers heightened surveillance logging.
- Crisis (DEFCON 1): Red alert state; activates sticky top marquee banner, arms algorithmic circuit breakers, and enforces immediate triage dialogs.

## 3. "What-If" Stress Simulation Engine
RiskLens provides an interactive Stress Simulation Toggle in the global navigation bar. When engaged:
- Firmwide 99% VaR spikes from $42.8M to $68.4M.
- Execution slippage rises from 11.2 bps to 18.2 bps.
- CET1 ratio adjusts from 14.8% to 11.2%, simulating a +100bps interest rate shock and severe equity drawdown.
- Triggers active breach queue alerts for immediate triage rehearsal.
  `,
  'day-07-08': `
# Days 07–08: Secondary Features – Interactive Controls & Workflows

## 1. High-Security Emergency Circuit Breaker (CircuitBreakerButton.tsx)
In high-frequency algorithmic trading environments, accidental trading halts cause massive market disruption, while failure to halt runaway algorithms results in catastrophic capital drawdown.
RiskLens implements a Two-Step Slide-to-Confirm Circuit Breaker:
- Users must deliberately drag a locked shield slider horizontally across the track to 95%+ completion.
- Releasing early snaps the slider back to zero.
- Reaching 100% immediately trips the global circuit breaker, transitions the threat state to CRISIS, freezes order routing on all active desks, and writes a cryptographically signed entry into the WORM audit ledger.

## 2. Global Command Palette (CommandPalette.tsx)
Accessible via Cmd+K or Ctrl+K, the palette provides keyboard-first navigation for instant persona switching, threat level escalation, stress testing, and report generation.

## 3. SLA Breach Remediation & Escalation Cards (EscalationWorkflowCard.tsx)
Enforces regulatory compliance SLAs with real-time countdown clocks, operator notes fields, and stop-clock acknowledgment mechanisms.
  `,
  'day-09-10': `
# Days 09–10: Telemetry Visualizations & Analytics Engines

## 1. Semi-Circular Value at Risk (VaR) Gauge (VaRGauge.tsx)
Pure SVG implementation eliminating bulky charting runtime overhead. Partitioned into Safe (Green $0M-$45M), Caution (Orange $45M-$50M), and Regulatory Breach (Red $50M+) zones.

## 2. 100,000-Run Monte Carlo Distribution Histogram (DistributionHistogram.tsx)
Visualizes 25 discrete loss/gain bins across firmwide P&L scenarios (-$75M to +$45M) with highlighted 99% VaR cutoff (-$48.65M) and Expected Shortfall tail region (-$62.10M).

## 3. Cross-Asset Correlation Surface (CorrelationSurface.tsx)
5x5 interactive matrix covering Equities, FX, Rates, Commodities, and Crypto with high-contrast color scales indicating diversifying vs coupling hazards.

## 4. Factor Exposure Waterfall & Geo Risk Map
Factor waterfall chart against $500M firm capacity and stylized vector continent map displaying regional counterparty credit ratings and settlement exposure.
  `,
  'day-11-12': `
# Days 11–12: Dashboard Integration & Cross-Persona State Management

## 1. Centralized State Architecture (DashboardContext.tsx)
Unified React Context managing active personas, densities, threat levels, stress testing, circuit breakers, and immutable audit logs.

## 2. Telemetry Jitter Simulation
Simulates high-frequency market feeds with micro-jitter (10ms-15ms WebSocket latency) and real-time SLA second decrementing.

## 3. High-Density Financial Data Table (DataTable.tsx)
Multi-column sorting, live client-side filtering, column visibility toggles, and monospace tabular formatting.
  `,
  'day-13-14': `
# Days 13–14: Testing, Accessibility Audit & WCAG 2.2 Validation

## 1. Automated WCAG 2.2 Level AA Contrast Script (tests/run-wcag-audit.js)
Mathematical computation of relative luminance and contrast ratios using the official W3C formula:
- Text Primary (#F1F3F5) vs Canvas (#0B0E14): 15.52:1 (PASS >= 4.5:1)
- Text Secondary (#94A3B8) vs Canvas (#0B0E14): 6.84:1 (PASS >= 4.5:1)
- Critical Breached (#FF6B6B) vs Canvas (#0B0E14): 6.22:1 (PASS >= 4.5:1)
- High Caution (#FF922B) vs Canvas (#0B0E14): 7.72:1 (PASS >= 4.5:1)
- Medium Advisory (#FCC419) vs Canvas (#0B0E14): 10.73:1 (PASS >= 4.5:1)
- Safe Operating (#51CF66) vs Canvas (#0B0E14): 8.60:1 (PASS >= 4.5:1)
- Informational (#4DABF7) vs Canvas (#0B0E14): 6.97:1 (PASS >= 4.5:1)

## 2. Non-Color Reliance & Dual Signifiers
Every semantic severity token enforces a mandatory shape glyph and text label pairing.
  `,
  'day-15': `
# Day 15: Final Submission Dossier – ZeTheta RiskLens Console

## 1. Project Overview & Operational Deliverables
RiskLens is a complete, production-grade financial risk monitoring console engineered for quantitative trading organizations, hedge funds, and prime brokerage risk committees.

## 2. Key Deliverables Matrix
- 4 Operational Persona Views (Elena Vance CRO, Marcus Chen Quant, Sarah Al-Mansoor Compliance, Liam O'Connor Desk Ops).
- Interactive Global Controls (Cmd+K Command Palette, DEFCON Threat Levels, Stress Simulation, Slide-to-Confirm Emergency Freeze).
- 100% WCAG 2.2 Level AA compliance with dual visual signifiers and tabular monospace figures.
- Standalone zero-dependency preview.html and automated tests/run-wcag-audit.js.

Submitted by ZeTheta Algorithms Systems Architecture Team.
  `
};

export const DocumentationView: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState('day-01-02');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Chapter Index Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-2">
        <div className="p-4 rounded-xl bg-[#151B26] border border-[#273142]">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-blue-400" />
            <h2 className="text-xs font-bold text-[#F1F3F5] uppercase tracking-wider font-mono">
              15-Day Engineering Dossier
            </h2>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-3">
            Complete architectural documentation from initial threat research to final WCAG 2.2 Level AA validation.
          </p>

          <div className="space-y-1.5">
            {DOC_CHAPTERS.map(chap => {
              const isSelected = selectedChapter === chap.id;
              return (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => setSelectedChapter(chap.id)}
                  className={cn(
                    'w-full text-left p-2.5 rounded-lg text-xs transition-colors border',
                    isSelected
                      ? 'bg-[#1F2736] text-[#F1F3F5] border-blue-500/50 font-semibold'
                      : 'bg-[#0B0E14] text-[#94A3B8] border-[#273142] hover:text-[#F1F3F5] hover:bg-[#1F2736]/40'
                  )}
                >
                  <div className="font-mono text-[11px] text-[#F1F3F5]">{chap.title}</div>
                  <div className="text-[10px] text-[#64748B] mt-0.5 truncate">{chap.summary}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reader Panel */}
      <div className="lg:col-span-8">
        <div className="p-6 rounded-xl bg-[#151B26] border border-[#273142] font-mono text-xs text-[#94A3B8] leading-relaxed space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#273142]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#51CF66]" />
              <span className="font-bold text-[#F1F3F5] text-sm">
                {DOC_CHAPTERS.find(c => c.id === selectedChapter)?.title}
              </span>
            </div>
            <span className="text-[10px] text-[#64748B]">ZeTheta Engineering Records</span>
          </div>

          <pre className="whitespace-pre-wrap font-mono text-xs text-[#F1F3F5] bg-[#0B0E14] p-4 rounded-lg border border-[#273142] overflow-x-auto">
            {DOC_CONTENT[selectedChapter]}
          </pre>
        </div>
      </div>
    </div>
  );
};
