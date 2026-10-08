import React from 'react';
import { cn } from '../../utils/cn';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const trackSizes = size === 'sm' ? 'w-8 h-4' : 'w-10 h-5';
  const thumbSizes = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const translateDistance = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]',
          trackSizes,
          checked ? 'bg-blue-600' : 'bg-[#273142]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-md transform transition duration-200 ease-in-out mt-0.5 ml-0.5',
            thumbSizes,
            checked ? translateDistance : 'translate-x-0'
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && (
            <span className="text-xs font-medium text-[#F1F3F5] tracking-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-[#64748B]">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
