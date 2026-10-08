import React from 'react';
import { cn } from '../../utils/cn';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  className
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px h-full min-h-[16px] bg-[#273142] self-stretch shrink-0', className)}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn('relative flex items-center w-full my-3', className)}
      >
        <div className="grow border-t border-[#273142]" />
        <span className="shrink-0 px-2.5 text-[11px] font-mono text-[#64748B] tracking-wider uppercase">
          {label}
        </span>
        <div className="grow border-t border-[#273142]" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('w-full border-t border-[#273142] my-2', className)}
    />
  );
};
