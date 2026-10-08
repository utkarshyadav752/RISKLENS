import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { PersonaRole, LayoutDensity } from '../types/persona';
import { PERSONA_PROFILES } from '../types/persona';
import type {
  SystemThreatLevel,
  BreachAlert,
  AuditLogEntry,
  TradingDeskTelemetry,
  SeverityLevel
} from '../types/risk';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  timestamp: string;
}

interface DashboardContextType {
  currentPersona: PersonaRole;
  setPersona: (role: PersonaRole) => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  density: LayoutDensity;
  setDensity: (density: LayoutDensity) => void;
  threatLevel: SystemThreatLevel;
  setThreatLevel: (level: SystemThreatLevel) => void;
  isSimulationMode: boolean;
  toggleSimulationMode: () => void;
  isCircuitBreakerTripped: boolean;
  tripCircuitBreaker: (deskId?: string) => void;
  resetCircuitBreaker: () => void;
  timeRange: string;
  setTimeRange: (range: string) => void;
  breaches: BreachAlert[];
  acknowledgeBreach: (id: string, notes?: string) => void;
  escalateBreach: (id: string) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'sha256Hash'>) => void;
  tradingDesks: TradingDeskTelemetry[];
  freezeDesk: (deskId: string) => void;
  unfreezeDesk: (deskId: string) => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, severity?: SeverityLevel) => void;
  dismissToast: (id: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  widgetCustomizerOpen: boolean;
  setWidgetCustomizerOpen: (open: boolean) => void;
  activeDrawer: { type: string; payload?: unknown } | null;
  openDrawer: (type: string, payload?: unknown) => void;
  closeDrawer: () => void;
  widgetVisibility: Record<string, boolean>;
  toggleWidget: (widgetId: string) => void;
  liveSocketLatencyMs: number;
}

const INITIAL_BREACHES: BreachAlert[] = [
  {
    id: 'BR-2026-9041',
    timestamp: '10:14:02 UTC',
    title: 'Intraday 99% VaR Threshold Exceeded',
    desk: 'HFT Delta Equities Desk',
    assetClass: 'Equities',
    metric: '99% Parametric VaR',
    currentValue: 48.65,
    thresholdValue: 45.00,
    unit: '$M',
    severity: 'critical',
    slaSecondsRemaining: 340,
    assignedTo: 'Sarah Al-Mansoor',
    status: 'open',
    ruleReference: 'SEC Rule 15c3-5(b) - Pre-Trade Capital Threshold'
  },
  {
    id: 'BR-2026-9042',
    timestamp: '10:22:15 UTC',
    title: 'Execution Slippage Anomaly (Cross-Currency)',
    desk: 'FX Options & Forward Arbitrage',
    assetClass: 'FX',
    metric: 'Order Slippage Index',
    currentValue: 14.8,
    thresholdValue: 10.0,
    unit: 'bps',
    severity: 'high',
    slaSecondsRemaining: 780,
    assignedTo: 'Liam O\'Connor',
    status: 'investigating',
    ruleReference: 'MiFID II RTS 27 Best Execution Quality Protocol'
  },
  {
    id: 'BR-2026-9043',
    timestamp: '10:29:40 UTC',
    title: 'Concentration Warning in High-Yield Sovereign Spreads',
    desk: 'Fixed Income Rates Macro',
    assetClass: 'Fixed Income',
    metric: 'Single-Issuer Concentration',
    currentValue: 19.4,
    thresholdValue: 18.0,
    unit: '%',
    severity: 'medium',
    slaSecondsRemaining: 1820,
    assignedTo: 'Marcus Chen',
    status: 'open',
    ruleReference: 'Basel III Internal Models Approach (IMA) Cap'
  },
  {
    id: 'BR-2026-9044',
    timestamp: '09:45:10 UTC',
    title: 'Crypto Basis Arbitrage Gamma Drift',
    desk: 'Digital Assets & Derivatives',
    assetClass: 'Crypto',
    metric: 'Gamma Tail Slope',
    currentValue: 3.2,
    thresholdValue: 3.0,
    unit: 'Index',
    severity: 'high',
    slaSecondsRemaining: 510,
    assignedTo: 'Elena Vance',
    status: 'open',
    ruleReference: 'RiskLens Algorithmic Risk Limit Alpha-4'
  }
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-8831',
    timestamp: '10:31:05.124 UTC',
    eventType: 'BREACH_DETECTED',
    operator: 'SYSTEM_DAEMON_ZE1',
    desk: 'HFT Delta Equities Desk',
    description: 'VaR 99% computed at $48.65M against soft ceiling $45.00M. Alert published to Kafka topic risk.breaches.v2.',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signatureStatus: 'VERIFIED',
    ipAddress: '10.240.12.88'
  },
  {
    id: 'AUD-8830',
    timestamp: '10:24:48.810 UTC',
    eventType: 'SLA_ACKNOWLEDGED',
    operator: 'Liam O\'Connor',
    desk: 'FX Options & Forward Arbitrage',
    description: 'Operator acknowledged 14.8 bps slippage spike on EUR/USD block orders. Routed to liquidity bridge backup.',
    sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    signatureStatus: 'VERIFIED',
    ipAddress: '10.240.14.102'
  },
  {
    id: 'AUD-8829',
    timestamp: '10:12:19.450 UTC',
    eventType: 'THRESHOLD_UPDATED',
    operator: 'Elena Vance',
    desk: 'Enterprise Macro Governance',
    description: 'Tier 1 Capital Adequacy buffer floor calibrated from 13.5% to 14.0% per PRA quarterly stress cycle.',
    sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    signatureStatus: 'VERIFIED',
    ipAddress: '10.240.10.5'
  },
  {
    id: 'AUD-8828',
    timestamp: '09:50:33.201 UTC',
    eventType: 'LIMIT_OVERRIDE',
    operator: 'Sarah Al-Mansoor',
    desk: 'Fixed Income Rates Macro',
    description: 'Temporary 60-minute limit override granted for EU Bond primary auction allocation under Rule 15c3-5 exception clause.',
    sha256Hash: '3b9f4a8b7c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
    signatureStatus: 'VERIFIED',
    ipAddress: '10.240.11.23'
  }
];

const INITIAL_TRADING_DESKS: TradingDeskTelemetry[] = [
  {
    id: 'desk-hft-eq',
    name: 'HFT Delta Equities Desk',
    strategy: 'Cross-Market Statistical Arbitrage',
    traderLead: 'Liam O\'Connor',
    activeOrders: 14280,
    marginUtilizationPct: 92.4,
    maxMarginUsd: 150000000,
    allocatedMarginUsd: 138600000,
    intradayPnlUsd: 2845000,
    slippageBps: 11.2,
    status: 'warning',
    lastHeartbeatMs: 8
  },
  {
    id: 'desk-fx-opt',
    name: 'FX Options & Forward Arbitrage',
    strategy: 'G10 Volatility Surface Skew',
    traderLead: 'Kiran Patel',
    activeOrders: 4320,
    marginUtilizationPct: 74.2,
    maxMarginUsd: 200000000,
    allocatedMarginUsd: 148400000,
    intradayPnlUsd: 1120000,
    slippageBps: 14.8,
    status: 'warning',
    lastHeartbeatMs: 14
  },
  {
    id: 'desk-rates-macro',
    name: 'Fixed Income & Sovereign Rates',
    strategy: 'Curve Flattening & Yield Arbitrage',
    traderLead: 'Helena Berg',
    activeOrders: 1840,
    marginUtilizationPct: 58.1,
    maxMarginUsd: 350000000,
    allocatedMarginUsd: 203350000,
    intradayPnlUsd: 3490000,
    slippageBps: 2.1,
    status: 'active',
    lastHeartbeatMs: 22
  },
  {
    id: 'desk-crypto-der',
    name: 'Digital Assets & Basis Arbitrage',
    strategy: 'CME vs Spot Funding Dislocation',
    traderLead: 'Zack Chen',
    activeOrders: 8900,
    marginUtilizationPct: 83.7,
    maxMarginUsd: 75000000,
    allocatedMarginUsd: 62775000,
    intradayPnlUsd: -420000,
    slippageBps: 8.4,
    status: 'active',
    lastHeartbeatMs: 11
  },
  {
    id: 'desk-commodities',
    name: 'Energy & Metals Quantitative',
    strategy: 'Calendar Spread Mean Reversion',
    traderLead: 'Camille Dupuis',
    activeOrders: 2150,
    marginUtilizationPct: 41.5,
    maxMarginUsd: 120000000,
    allocatedMarginUsd: 49800000,
    intradayPnlUsd: 875000,
    slippageBps: 3.5,
    status: 'active',
    lastHeartbeatMs: 18
  }
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPersona, setCurrentPersonaState] = useState<PersonaRole>('cro');
  const [activeNavTab, setActiveNavTab] = useState<string>('cro');
  const [density, setDensity] = useState<LayoutDensity>('comfortable');
  const [threatLevel, setThreatLevel] = useState<SystemThreatLevel>('normal');
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [isCircuitBreakerTripped, setIsCircuitBreakerTripped] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>('1D');
  const [breaches, setBreaches] = useState<BreachAlert[]>(INITIAL_BREACHES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [tradingDesks, setTradingDesks] = useState<TradingDeskTelemetry[]>(INITIAL_TRADING_DESKS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [widgetCustomizerOpen, setWidgetCustomizerOpen] = useState<boolean>(false);
  const [activeDrawer, setActiveDrawer] = useState<{ type: string; payload?: unknown } | null>(null);
  const [liveSocketLatencyMs, setLiveSocketLatencyMs] = useState<number>(12);

  const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>({
    var_gauge: true,
    risk_matrix: true,
    capital_adequacy: true,
    monte_carlo: true,
    correlation_surface: true,
    portfolio_greeks: true,
    breach_queue: true,
    audit_timeline: true,
    desk_telemetry: true,
    geo_risk_map: true,
    waterfall_exposure: true,
    circuit_breaker: true
  });

  // Keep density and activeNavTab synchronized with persona changes by default
  const setPersona = useCallback((role: PersonaRole) => {
    setCurrentPersonaState(role);
    setActiveNavTab(role);
    setDensity(PERSONA_PROFILES[role].defaultDensity);
  }, []);

  // Micro-jitter simulation for live WebSocket heartbeat indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSocketLatencyMs(Math.floor(10 + Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // SLA countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setBreaches(prev =>
        prev.map(b => (b.status === 'open' && b.slaSecondsRemaining > 0
          ? { ...b, slaSecondsRemaining: b.slaSecondsRemaining - 1 }
          : b))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = useCallback((title: string, message: string, severity: SeverityLevel = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = {
      id,
      title,
      message,
      severity,
      timestamp: new Date().toLocaleTimeString()
    };
    setToasts(prev => [newToast, ...prev].slice(0, 4));

    // Auto dismiss after 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const acknowledgeBreach = useCallback((id: string, notes?: string) => {
    setBreaches(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'acknowledged' } : b))
    );
    const target = breaches.find(b => b.id === id);
    const logDesc = notes
      ? `Breach ${id} acknowledged. Notes: ${notes}`
      : `Breach ${id} status updated to ACKNOWLEDGED by ${PERSONA_PROFILES[currentPersona].name}.`;

    const newLog: AuditLogEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      eventType: 'SLA_ACKNOWLEDGED',
      operator: PERSONA_PROFILES[currentPersona].name,
      desk: target?.desk || 'General',
      description: logDesc,
      sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      signatureStatus: 'VERIFIED',
      ipAddress: '10.240.10.15'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast('Breach Acknowledged', `Breach ID ${id} SLA stop-clock applied.`, 'safe');
  }, [breaches, currentPersona, showToast]);

  const escalateBreach = useCallback((id: string) => {
    setBreaches(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'investigating', severity: 'critical' } : b))
    );
    const newLog: AuditLogEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      eventType: 'BREACH_DETECTED',
      operator: PERSONA_PROFILES[currentPersona].name,
      desk: 'Escalation Board',
      description: `Breach ${id} formally escalated to Executive Risk Committee & Compliance Officers.`,
      sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      signatureStatus: 'VERIFIED',
      ipAddress: '10.240.10.15'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast('Breach Escalated', `Incident ${id} routed to Chief Risk Officer queue.`, 'critical');
  }, [currentPersona, showToast]);

  const addAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'sha256Hash'>) => {
    const newLog: AuditLogEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      ...entry
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  const freezeDesk = useCallback((deskId: string) => {
    setTradingDesks(prev =>
      prev.map(d => (d.id === deskId ? { ...d, status: 'frozen' } : d))
    );
    const targetDesk = tradingDesks.find(d => d.id === deskId);
    const newLog: AuditLogEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      eventType: 'CIRCUIT_BREAKER_TRIPPED',
      operator: PERSONA_PROFILES[currentPersona].name,
      desk: targetDesk?.name || deskId,
      description: `Algorithmic order execution FROZEN for desk ${targetDesk?.name || deskId}. Router canceled open orders.`,
      sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      signatureStatus: 'VERIFIED',
      ipAddress: '10.240.14.9'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast('Trading Desk Frozen', `${targetDesk?.name || deskId} order routing has been halted immediately.`, 'critical');
  }, [currentPersona, showToast, tradingDesks]);

  const unfreezeDesk = useCallback((deskId: string) => {
    setTradingDesks(prev =>
      prev.map(d => (d.id === deskId ? { ...d, status: 'active' } : d))
    );
    const targetDesk = tradingDesks.find(d => d.id === deskId);
    const newLog: AuditLogEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      eventType: 'LIMIT_OVERRIDE',
      operator: PERSONA_PROFILES[currentPersona].name,
      desk: targetDesk?.name || deskId,
      description: `Desk execution resumed for ${targetDesk?.name || deskId} following operational risk check.`,
      sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      signatureStatus: 'VERIFIED',
      ipAddress: '10.240.14.9'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast('Desk Resumed', `${targetDesk?.name || deskId} orders un-frozen.`, 'safe');
  }, [currentPersona, showToast, tradingDesks]);

  const tripCircuitBreaker = useCallback((deskId?: string) => {
    setIsCircuitBreakerTripped(true);
    setThreatLevel('crisis');
    if (deskId) {
      freezeDesk(deskId);
    } else {
      // Freeze all desks
      setTradingDesks(prev => prev.map(d => ({ ...d, status: 'frozen' })));
    }
    const newLog: AuditLogEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      eventType: 'CIRCUIT_BREAKER_TRIPPED',
      operator: PERSONA_PROFILES[currentPersona].name,
      desk: deskId || 'GLOBAL_ALL_DESKS',
      description: 'EMERGENCY CIRCUIT BREAKER ACTIVATED: ALL ALGORITHMIC ORDER ENTRY HALTED.',
      sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      signatureStatus: 'VERIFIED',
      ipAddress: '10.240.1.1'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast('EMERGENCY CIRCUIT BREAKER TRIPPED', 'All algorithmic executions locked. System entered CRISIS state.', 'critical');
  }, [currentPersona, freezeDesk, showToast]);

  const resetCircuitBreaker = useCallback(() => {
    setIsCircuitBreakerTripped(false);
    setThreatLevel('normal');
    setTradingDesks(prev => prev.map(d => ({ ...d, status: 'active' })));
    showToast('Circuit Breaker Reset', 'Order execution un-frozen. Standard telemetry resumed.', 'safe');
  }, [showToast]);

  const toggleSimulationMode = useCallback(() => {
    setIsSimulationMode(prev => {
      const next = !prev;
      if (next) {
        setThreatLevel('elevated');
        showToast(
          'Stress Simulation Active',
          'Market shock applied: +100bps rate shift, equity vol +45%, VaR spiked to $68.4M.',
          'high'
        );
      } else {
        setThreatLevel('normal');
        showToast(
          'Simulation Terminated',
          'Metrics returned to baseline real-time market data feed.',
          'info'
        );
      }
      return next;
    });
  }, [showToast]);

  const toggleWidget = useCallback((widgetId: string) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  }, []);

  const openDrawer = useCallback((type: string, payload?: unknown) => {
    setActiveDrawer({ type, payload });
  }, []);

  const closeDrawer = useCallback(() => {
    setActiveDrawer(null);
  }, []);

  // Keyboard shortcut listener for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(open => !open);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setActiveDrawer(null);
        setWidgetCustomizerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const contextValue = useMemo(() => ({
    currentPersona,
    setPersona,
    activeNavTab,
    setActiveNavTab,
    density,
    setDensity,
    threatLevel,
    setThreatLevel,
    isSimulationMode,
    toggleSimulationMode,
    isCircuitBreakerTripped,
    tripCircuitBreaker,
    resetCircuitBreaker,
    timeRange,
    setTimeRange,
    breaches,
    acknowledgeBreach,
    escalateBreach,
    auditLogs,
    addAuditLog,
    tradingDesks,
    freezeDesk,
    unfreezeDesk,
    toasts,
    showToast,
    dismissToast,
    commandPaletteOpen,
    setCommandPaletteOpen,
    widgetCustomizerOpen,
    setWidgetCustomizerOpen,
    activeDrawer,
    openDrawer,
    closeDrawer,
    widgetVisibility,
    toggleWidget,
    liveSocketLatencyMs
  }), [
    currentPersona,
    setPersona,
    activeNavTab,
    setActiveNavTab,
    density,
    threatLevel,
    isSimulationMode,
    toggleSimulationMode,
    isCircuitBreakerTripped,
    tripCircuitBreaker,
    resetCircuitBreaker,
    timeRange,
    breaches,
    acknowledgeBreach,
    escalateBreach,
    auditLogs,
    addAuditLog,
    tradingDesks,
    freezeDesk,
    unfreezeDesk,
    toasts,
    showToast,
    dismissToast,
    commandPaletteOpen,
    widgetCustomizerOpen,
    activeDrawer,
    openDrawer,
    closeDrawer,
    widgetVisibility,
    toggleWidget,
    liveSocketLatencyMs
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
