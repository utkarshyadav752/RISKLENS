import React, { useState, useRef, useEffect } from 'react';
import { Columns3, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ColumnDefinition {
  key: string;
  label: string;
  visible: boolean;
}

interface ColumnVisibilityDropdownProps {
  columns: ColumnDefinition[];
  onToggleColumn: (key: string) => void;
  className?: string;
}

export const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({
  columns,
  onToggleColumn,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B0E14] border border-[#273142] text-[11px] font-mono text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#1F2736] transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <Columns3 size={13} />
        <span>Columns</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-48 rounded-lg bg-[#1F2736] border border-[#273142] shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#64748B] border-b border-[#273142]/60 mb-1">
            Toggle Columns
          </div>
          {columns.map(col => (
            <button
              key={col.key}
              type="button"
              role="menuitemcheckbox"
              aria-checked={col.visible}
              onClick={() => onToggleColumn(col.key)}
              className="w-full text-left px-3 py-1.5 text-xs text-[#F1F3F5] hover:bg-[#273142] flex items-center justify-between"
            >
              <span>{col.label}</span>
              <span className={cn('w-4 h-4 rounded flex items-center justify-center border', col.visible ? 'bg-blue-600 border-blue-500 text-white' : 'border-[#273142]')}>
                {col.visible && <Check size={11} strokeWidth={3} />}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
