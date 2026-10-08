import type { SeverityLevel, SystemThreatLevel } from '../types/risk';

export interface SeverityToken {
  level: SeverityLevel;
  label: string;
  hex: string;
  bgHex: string;
  borderHex: string;
  glyph: string;
  glyphShape: 'octagon' | 'triangle' | 'diamond' | 'circle' | 'square';
  iconName: 'OctagonAlert' | 'TriangleAlert' | 'Diamond' | 'CheckCircle2' | 'Info';
  contrastOnCanvas: number; // Against #0B0E14
  contrastOnCard: number; // Against #151B26
  ariaRoleDescription: string;
}

export const SEVERITY_TOKENS: Record<SeverityLevel, SeverityToken> = {
  critical: {
    level: 'critical',
    label: 'Critical Breached',
    hex: '#FF6B6B',
    bgHex: 'rgba(255, 107, 107, 0.12)',
    borderHex: '#FF6B6B',
    glyph: '🛑',
    glyphShape: 'octagon',
    iconName: 'OctagonAlert',
    contrastOnCanvas: 6.22,
    contrastOnCard: 5.68,
    ariaRoleDescription: 'Critical risk breach requiring immediate remediation'
  },
  high: {
    level: 'high',
    label: 'High Caution',
    hex: '#FF922B',
    bgHex: 'rgba(255, 146, 43, 0.12)',
    borderHex: '#FF922B',
    glyph: '⚠️',
    glyphShape: 'triangle',
    iconName: 'TriangleAlert',
    contrastOnCanvas: 7.72,
    contrastOnCard: 7.05,
    ariaRoleDescription: 'High risk approaching ceiling threshold'
  },
  medium: {
    level: 'medium',
    label: 'Medium Advisory',
    hex: '#FCC419',
    bgHex: 'rgba(252, 196, 25, 0.12)',
    borderHex: '#FCC419',
    glyph: '🔶',
    glyphShape: 'diamond',
    iconName: 'Diamond',
    contrastOnCanvas: 10.73,
    contrastOnCard: 9.80,
    ariaRoleDescription: 'Medium volatility advisory'
  },
  safe: {
    level: 'safe',
    label: 'Safe Operating',
    hex: '#51CF66',
    bgHex: 'rgba(81, 207, 102, 0.12)',
    borderHex: '#51CF66',
    glyph: '🟢',
    glyphShape: 'circle',
    iconName: 'CheckCircle2',
    contrastOnCanvas: 8.60,
    contrastOnCard: 7.85,
    ariaRoleDescription: 'Metric nominal within authorized limits'
  },
  info: {
    level: 'info',
    label: 'Informational',
    hex: '#4DABF7',
    bgHex: 'rgba(77, 171, 247, 0.12)',
    borderHex: '#4DABF7',
    glyph: 'ℹ️',
    glyphShape: 'square',
    iconName: 'Info',
    contrastOnCanvas: 6.97,
    contrastOnCard: 6.36,
    ariaRoleDescription: 'Informational parameter'
  }
};

export const COLOR_SURFACES = {
  canvasBase: '#0B0E14',
  surfaceCard: '#151B26',
  surfaceElevated: '#1F2736',
  surfaceBorder: '#273142',
  textPrimary: '#F1F3F5',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  brandAccent: '#2563EB',
  brandAccentHover: '#1D4ED8'
};

export const THREAT_LEVEL_CONFIG: Record<SystemThreatLevel, {
  label: string;
  badgeText: string;
  badgeColor: string;
  bannerTone: 'normal' | 'caution' | 'emergency';
  description: string;
}> = {
  normal: {
    label: 'DEFCON 5 / Normal',
    badgeText: 'NOMINAL MONITORING',
    badgeColor: '#51CF66',
    bannerTone: 'normal',
    description: 'Trading desk risk telemetry within standard volatility boundaries.'
  },
  elevated: {
    label: 'DEFCON 3 / Elevated',
    badgeText: 'ELEVATED SURVEILLANCE',
    badgeColor: '#FF922B',
    bannerTone: 'caution',
    description: 'Cross-desk VaR and order latency exceeding standard statistical tolerance.'
  },
  crisis: {
    label: 'DEFCON 1 / Crisis',
    badgeText: 'CRITICAL THREAT ACTIVE',
    badgeColor: '#FF6B6B',
    bannerTone: 'emergency',
    description: 'Multiple regulatory limits breached. Circuit breaker freeze armed.'
  }
};
