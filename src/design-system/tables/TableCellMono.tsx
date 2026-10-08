import React from 'react';
import { cn } from '../../utils/cn';

interface TableCellMonoProps {
  value: number | string;
  format?: 'currency' | 'percent' | 'bps' | 'raw';
  deltaDirection?: 'up' | 'down' | 'neutral';
  colorizeDelta?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const TableCellMono: React.FC<TableCellMonoProps> = ({
  value,
  format = 'raw',
  deltaDirection,
  colorizeDelta = false,
  align = 'right',
  className
}) => {
  const formatValue = () => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        if (Math.abs(value) >= 1_000_000) {
          return `$${(value / 1_000_000).toFixed(2)}M`;
        }
        if (Math.abs(value) >= 1_000) {
          return `$${(value / 1_000).toFixed(1)}k`;
        }
        return `$${value.toFixed(2)}`;
      case 'percent':
        return `${value > 0 && deltaDirection ? '+' : ''}${value.toFixed(2)}%`;
      case 'bps':
        return `${value.toFixed(1)} bps`;
      case 'raw':
      default:
        return value.toLocaleString();
    }
  };

  const getColorClass = () => {
    if (!colorizeDelta) return 'text-[#F1F3F5]';
    if (deltaDirection === 'up' || (typeof value === 'number' && value > 0 && format === 'percent')) {
      return 'text-[#FF6B6B]'; // Risk up / positive slippage / positive var delta is red
    }
    if (deltaDirection === 'down' || (typeof value === 'number' && value < 0 && format === 'percent')) {
      return 'text-[#51CF66]'; // Risk down is safe green
    }
    return 'text-[#F1F3F5]';
  };

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <span
      className={cn(
        'font-mono text-xs font-medium tabular-nums whitespace-nowrap',
        alignClass,
        getColorClass(),
        className
      )}
    >
      {formatValue()}
    </span>
  );
};
