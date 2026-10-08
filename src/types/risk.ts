export type SeverityLevel = 'critical' | 'high' | 'medium' | 'safe' | 'info';

export type SystemThreatLevel = 'normal' | 'elevated' | 'crisis';

export type BreachStatus = 'open' | 'investigating' | 'acknowledged' | 'remediated';

export interface BreachAlert {
  id: string;
  timestamp: string;
  title: string;
  desk: string;
  assetClass: 'Equities' | 'FX' | 'Fixed Income' | 'Commodities' | 'Crypto' | 'Credit';
  metric: string;
  currentValue: number;
  thresholdValue: number;
  unit: string;
  severity: SeverityLevel;
  slaSecondsRemaining: number;
  assignedTo: string;
  status: BreachStatus;
  ruleReference: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: 'BREACH_DETECTED' | 'CIRCUIT_BREAKER_TRIPPED' | 'LIMIT_OVERRIDE' | 'THRESHOLD_UPDATED' | 'SLA_ACKNOWLEDGED' | 'COMPLIANCE_SIGN_OFF';
  operator: string;
  desk: string;
  description: string;
  sha256Hash: string;
  signatureStatus: 'VERIFIED' | 'PENDING' | 'INVALID';
  ipAddress: string;
}

export interface RiskMetric {
  id: string;
  name: string;
  category: 'Capital' | 'Market' | 'Credit' | 'Liquidity' | 'Operational';
  value: number;
  formattedValue: string;
  benchmark: string;
  unit: string;
  deltaPercent: number;
  deltaDirection: 'up' | 'down' | 'neutral';
  historicalSparkline: number[];
  severity: SeverityLevel;
}

export interface TradingDeskTelemetry {
  id: string;
  name: string;
  strategy: string;
  traderLead: string;
  activeOrders: number;
  marginUtilizationPct: number;
  maxMarginUsd: number;
  allocatedMarginUsd: number;
  intradayPnlUsd: number;
  slippageBps: number;
  status: 'active' | 'warning' | 'frozen';
  lastHeartbeatMs: number;
}

export interface GreeksAttribution {
  assetClass: string;
  deltaUsd: number;
  gammaUsd: number;
  vegaUsd: number;
  thetaUsdPerDay: number;
  rhoUsd: number;
}

export interface ExposureAttribution {
  category: string;
  allocatedUsd: number;
  limitUsd: number;
  utilizationPct: number;
  severity: SeverityLevel;
}
