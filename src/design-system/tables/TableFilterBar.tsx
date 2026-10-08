import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SeverityLevel } from '../../types/risk';

interface TableFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSeverity: SeverityLevel | 'all';
  onSeverityChange: (sev: SeverityLevel | 'all') => void;
  selectedAssetClass?: string;
  onAssetClassChange?: (asset: string) => void;
  assetClassOptions?: string[];
  className?: string;
}

export const TableFilterBar: React.FC<TableFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  selectedAssetClass = 'all',
  onAssetClassChange,
  assetClassOptions = ['Equities', 'FX', 'Fixed Income', 'Commodities', 'Crypto'],
  className
}) => {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2.5 pb-3', className)}>
      {/* Search Input */}
      <div className="relative flex items-center min-w-[220px] max-w-sm grow">
        <Search size={14} className="absolute left-2.5 text-[#64748B] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Filter by desk, metric, rule..."
          className="w-full bg-[#0B0E14] border border-[#273142] rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#F1F3F5] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 text-[#64748B] hover:text-[#F1F3F5]"
            aria-label="Clear filter search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Segmented Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <div className="flex items-center bg-[#0B0E14] p-0.5 rounded-lg border border-[#273142]">
          {(['all', 'critical', 'high', 'medium', 'safe'] as const).map(sev => {
            const isSelected = selectedSeverity === sev;
            const labels: Record<string, string> = {
              all: 'All Status',
              critical: 'Critical',
              high: 'High',
              medium: 'Medium',
              safe: 'Safe'
            };

            return (
              <button
                key={sev}
                type="button"
                onClick={() => onSeverityChange(sev)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-mono rounded-md font-medium transition-colors whitespace-nowrap',
                  isSelected
                    ? 'bg-[#1F2736] text-[#F1F3F5] shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F1F3F5]'
                )}
              >
                {labels[sev]}
              </button>
            );
          })}
        </div>

        {/* Asset Class Filter Dropdown */}
        {onAssetClassChange && (
          <select
            value={selectedAssetClass}
            onChange={e => onAssetClassChange(e.target.value)}
            className="bg-[#0B0E14] border border-[#273142] rounded-lg px-2.5 py-1 text-[11px] font-mono text-[#F1F3F5] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            aria-label="Filter by asset category"
          >
            <option value="all">All Asset Classes</option>
            {assetClassOptions.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
