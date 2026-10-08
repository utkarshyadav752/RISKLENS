import React from 'react';
import { cn } from '../../utils/cn';
import type { SeverityLevel } from '../../types/risk';
import { SEVERITY_TOKENS } from '../tokens';

interface StatusIndicatorProps {
  severity: SeverityLevel;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  severity,
  label,
  pulse = true,
  size = 'md',
  className
}) => {
  const token = SEVERITY_TOKENS[severity] || SEVERITY_TOKENS.safe;
  const displayLabel = label || token.label;

  const dotSizes = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  const dotColors: Record<SeverityLevel, string> = {
    critical: 'bg-[#FF6B6B]',
    high: 'bg-[#FF922B]',
    medium: 'bg-[#FCC419]',
    safe: 'bg-[#51CF66]',
    info: 'bg-[#4DABF7]'
  };

  return (
    <div
      role="status"
      aria-label={`${token.label}: ${displayLabel}`}
      className={cn('inline-flex items-center gap-2 select-none', className)}
    >
      <span className="relative flex items-center justify-center">
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              dotColors[severity]
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full', dotSizes, dotColors[severity])} />
      </span>
      <span className="text-xs font-mono font-medium text-[#94A3B8] tracking-tight">
        <span className="text-[10px] mr-1 opacity-70" aria-hidden="true">{token.glyph}</span>
        {displayLabel}
      </span>
    </div>
  );
};
