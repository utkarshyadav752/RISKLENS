import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
  className?: string;
}

export const DrawerModal: React.FC<DrawerModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'lg',
  className
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl'
  }[width];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full bg-[#151B26] border-l border-[#273142] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200',
          widthStyles,
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#273142] bg-[#0B0E14]/50">
          <div>
            <h2 className="text-sm font-semibold text-[#F1F3F5]">{title}</h2>
            {subtitle && (
              <p className="text-xs font-mono text-[#64748B] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F1F3F5] hover:bg-[#1F2736] transition-colors"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
