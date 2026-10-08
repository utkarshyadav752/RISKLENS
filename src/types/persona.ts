export type PersonaRole = 'cro' | 'quant' | 'compliance' | 'desk_ops';

export type LayoutDensity = 'comfortable' | 'standard' | 'compact';

export interface PersonaProfile {
  id: PersonaRole;
  name: string;
  title: string;
  department: string;
  avatarInitials: string;
  defaultDensity: LayoutDensity;
  description: string;
  primaryMetrics: string[];
  focusAreas: string[];
}

export const PERSONA_PROFILES: Record<PersonaRole, PersonaProfile> = {
  cro: {
    id: 'cro',
    name: 'Elena Vance',
    title: 'Chief Risk Officer',
    department: 'Executive Risk Office',
    avatarInitials: 'EV',
    defaultDensity: 'comfortable',
    description: 'Macro capital governance, board-level risk appetite, and regulatory solvency buffers.',
    primaryMetrics: ['Enterprise Capital at Risk', 'Tier 1 Capital Adequacy', 'Solvency II Buffer'],
    focusAreas: ['Concentration Risk', 'Board KPI Governance', 'Strategic Capital Limits']
  },
  quant: {
    id: 'quant',
    name: 'Marcus Chen',
    title: 'Senior Quantitative Analyst',
    department: 'Quantitative Analytics & Model Risk',
    avatarInitials: 'MC',
    defaultDensity: 'compact',
    description: 'High-dimension Monte Carlo simulations, volatility surfaces, cross-asset correlation matrices, and portfolio Greeks.',
    primaryMetrics: ['Parametric VaR 99%', 'Expected Shortfall (ES)', 'Delta/Gamma/Vega Attribution'],
    focusAreas: ['Monte Carlo 100k Runs', 'Cross-Asset Correlation', 'Extreme Value Tail Risk']
  },
  compliance: {
    id: 'compliance',
    name: 'Sarah Al-Mansoor',
    title: 'Compliance & Audit Lead',
    department: 'Regulatory Compliance & Surveillance',
    avatarInitials: 'SA',
    defaultDensity: 'standard',
    description: 'Active regulatory breach surveillance, SEC Rule 15c3-5 mandates, MiFID II compliance, and cryptographic audit ledgers.',
    primaryMetrics: ['Open SLA Breaches', 'SEC 15c3-5 Scorecard', 'MiFID II Order Audit SLA'],
    focusAreas: ['Breach Remediation Queue', 'Cryptographic Ledger Verification', 'Regulatory Filing Readiness']
  },
  desk_ops: {
    id: 'desk_ops',
    name: 'Liam O\'Connor',
    title: 'Trading Floor Operations Lead',
    department: 'High-Frequency Execution & Algorithmic Desks',
    avatarInitials: 'LO',
    defaultDensity: 'compact',
    description: 'Sub-second intraday margin consumption, order flow anomalies, desk limit proximity, and algorithmic freeze controls.',
    primaryMetrics: ['Desk Margin Utilization', 'Execution Slippage Bps', 'Algorithmic Anomaly Score'],
    focusAreas: ['Intraday Margin Proximity', 'Emergency Circuit Breakers', 'Order Route Telemetry']
  }
};
