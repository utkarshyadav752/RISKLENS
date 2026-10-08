import React from 'react';
import { cn } from '../../utils/cn';

interface SliderThresholdInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  description?: string;
  className?: string;
}

export const SliderThresholdInput: React.FC<SliderThresholdInputProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  description,
  className
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      <div className="flex items-center justify-between text-xs font-mono">
        <label htmlFor={`slider-${label}`} className="text-[#94A3B8] font-medium">
          {label}
        </label>
        <div className="flex items-center gap-1 font-semibold text-[#F1F3F5] tabular-nums">
          <span>{value}</span>
          {unit && <span className="text-[#64748B] text-[11px]">{unit}</span>}
        </div>
      </div>

      <input
        id={`slider-${label}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-[#1F2736] rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {description && (
        <span className="text-[10px] text-[#64748B]">
          {description}
        </span>
      )}
    </div>
  );
};
