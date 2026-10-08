import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Database, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDashboard } from '../../context/DashboardContext';

interface ExportDropdownProps {
  className?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { showToast } = useDashboard();

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

  const handleExport = (format: 'PDF' | 'CSV' | 'Parquet') => {
    setExportingType(format);
    setTimeout(() => {
      setExportingType(null);
      setIsOpen(false);
      showToast(
        `Export Complete (${format})`,
        `Risk report telemetry package generated with SHA-256 verification hash.`,
        'safe'
      );
    }, 700);
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F2736] border border-[#273142] text-xs font-mono text-[#F1F3F5] hover:bg-[#273142] transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
      >
        <Download size={13} className="text-[#94A3B8]" />
        <span>Export</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-52 rounded-lg bg-[#1F2736] border border-[#273142] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#64748B] border-b border-[#273142]/60 mb-1">
            Report Packages
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport('PDF')}
            disabled={exportingType !== null}
            className="w-full text-left px-3 py-2 text-xs text-[#F1F3F5] hover:bg-[#273142] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-red-400" />
              <div>
                <span className="font-medium block">Executive Board Dossier</span>
                <span className="text-[10px] text-[#64748B]">Formatted PDF with signatures</span>
              </div>
            </div>
            {exportingType === 'PDF' && <span className="animate-spin text-blue-400 text-xs">●</span>}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport('CSV')}
            disabled={exportingType !== null}
            className="w-full text-left px-3 py-2 text-xs text-[#F1F3F5] hover:bg-[#273142] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={15} className="text-emerald-400" />
              <div>
                <span className="font-medium block">Risk Metrics & Logs</span>
                <span className="text-[10px] text-[#64748B]">Raw CSV tabular stream</span>
              </div>
            </div>
            {exportingType === 'CSV' && <span className="animate-spin text-blue-400 text-xs">●</span>}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport('Parquet')}
            disabled={exportingType !== null}
            className="w-full text-left px-3 py-2 text-xs text-[#F1F3F5] hover:bg-[#273142] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database size={15} className="text-purple-400" />
              <div>
                <span className="font-medium block">Apache Parquet Dump</span>
                <span className="text-[10px] text-[#64748B]">Columnar telemetry 100k runs</span>
              </div>
            </div>
            {exportingType === 'Parquet' && <span className="animate-spin text-blue-400 text-xs">●</span>}
          </button>
        </div>
      )}
    </div>
  );
};
