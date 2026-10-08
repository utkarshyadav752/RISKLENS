import React from 'react';
import { cn } from '../../utils/cn';

interface TimeRangeSelectorProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  options?: string[];
  className?: string;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  options = ['1H', '1D', '1W', '1M', 'YTD', 'ALL'],
  className
}) => {
  return (
    <div
      role="group"
      aria-label="Time range selector"
      className={cn('inline-flex items-center bg-[#0B0E14] p-0.5 rounded-lg border border-[#273142]', className)}
    >
      {options.map(opt => {
        const isSelected = selectedRange === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onRangeChange(opt)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition-colors select-none focus:outline-none focus:ring-1 focus:ring-blue-500',
              isSelected
                ? 'bg-[#1F2736] text-[#F1F3F5] shadow-sm font-semibold'
                : 'text-[#94A3B8] hover:text-[#F1F3F5]'
            )}
            aria-pressed={isSelected}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};
