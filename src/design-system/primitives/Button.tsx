import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors select-none whitespace-nowrap shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'h-8 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-sm gap-2',
    lg: 'h-11 px-5 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm border border-blue-500/30',
    secondary: 'bg-[#1F2736] text-[#F1F3F5] hover:bg-[#273142] border border-[#273142] shadow-sm',
    danger: 'bg-red-600/90 text-white hover:bg-red-600 border border-red-500/30',
    ghost: 'text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#1F2736]/60',
    outline: 'border border-[#273142] text-[#F1F3F5] hover:bg-[#1F2736] hover:border-[#3B82F6]'
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';
