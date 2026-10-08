import React from 'react';
import { OctagonAlert, TriangleAlert, Diamond, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SeverityLevel } from '../../types/risk';
import { SEVERITY_TOKENS } from '../tokens';

interface RiskBadgeProps {
  severity: SeverityLevel;
  label?: string;
  size?: 'sm' | 'md';
  showGlyphText?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  severity,
  label,
  size = 'md',
  showGlyphText = false,
  className
}) => {
  const token = SEVERITY_TOKENS[severity] || SEVERITY_TOKENS.info;
  const displayLabel = label || token.label;

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : 14;
    switch (token.iconName) {
      case 'OctagonAlert':
        return <OctagonAlert size={iconSize} className="shrink-0 stroke-[2.5]" aria-hidden="true" />;
      case 'TriangleAlert':
        return <TriangleAlert size={iconSize} className="shrink-0 stroke-[2.5]" aria-hidden="true" />;
      case 'Diamond':
        return <Diamond size={iconSize} className="shrink-0 stroke-[2.5]" aria-hidden="true" />;
      case 'CheckCircle2':
        return <CheckCircle2 size={iconSize} className="shrink-0 stroke-[2.5]" aria-hidden="true" />;
      case 'Info':
      default:
        return <Info size={iconSize} className="shrink-0 stroke-[2.5]" aria-hidden="true" />;
    }
  };

  const colorClasses: Record<SeverityLevel, string> = {
    critical: 'text-[#FF6B6B] bg-[#FF6B6B]/15 border-[#FF6B6B]/40',
    high: 'text-[#FF922B] bg-[#FF922B]/15 border-[#FF922B]/40',
    medium: 'text-[#FCC419] bg-[#FCC419]/15 border-[#FCC419]/40',
    safe: 'text-[#51CF66] bg-[#51CF66]/15 border-[#51CF66]/40',
    info: 'text-[#4DABF7] bg-[#4DABF7]/15 border-[#4DABF7]/40'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1.5' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      role="status"
      aria-label={`${token.label}: ${displayLabel}`}
      className={cn(
        'inline-flex items-center font-mono font-medium rounded border whitespace-nowrap select-none',
        colorClasses[severity],
        sizeClasses,
        className
      )}
    >
      {renderIcon()}
      {showGlyphText && <span className="opacity-80 text-[10px]" aria-hidden="true">{token.glyph}</span>}
      <span className="tracking-tight">{displayLabel}</span>
    </span>
  );
};
