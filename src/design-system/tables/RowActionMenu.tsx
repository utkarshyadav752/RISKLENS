import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, FileText, AlertTriangle, Download, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RowActionMenuProps {
  onInspect?: () => void;
  onEscalate?: () => void;
  onExport?: () => void;
  onAcknowledge?: () => void;
  className?: string;
}

export const RowActionMenu: React.FC<RowActionMenuProps> = ({
  onInspect,
  onEscalate,
  onExport,
  onAcknowledge,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="p-1 rounded text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#1F2736] focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Row actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-44 rounded-lg bg-[#1F2736] border border-[#273142] shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {onInspect && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { onInspect(); setIsOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-[#F1F3F5] hover:bg-[#273142] flex items-center gap-2"
            >
              <FileText size={14} className="text-[#94A3B8]" />
              <span>Inspect Ledger</span>
            </button>
          )}

          {onAcknowledge && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { onAcknowledge(); setIsOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-[#51CF66] hover:bg-[#273142] flex items-center gap-2"
            >
              <ShieldCheck size={14} className="text-[#51CF66]" />
              <span>Acknowledge SLA</span>
            </button>
          )}

          {onEscalate && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { onEscalate(); setIsOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-[#FF6B6B] hover:bg-[#273142] flex items-center gap-2"
            >
              <AlertTriangle size={14} className="text-[#FF6B6B]" />
              <span>Escalate Breach</span>
            </button>
          )}

          {onExport && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { onExport(); setIsOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#273142] flex items-center gap-2 border-t border-[#273142]/60 mt-1 pt-1"
            >
              <Download size={14} className="text-[#94A3B8]" />
              <span>Export Record</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
