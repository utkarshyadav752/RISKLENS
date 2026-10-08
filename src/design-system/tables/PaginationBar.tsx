import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PaginationBarProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-[#94A3B8]', className)}>
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="bg-[#0B0E14] border border-[#273142] rounded px-1.5 py-0.5 text-xs text-[#F1F3F5] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <span className="font-mono text-[11px] tabular-nums">
          Showing <span className="text-[#F1F3F5] font-semibold">{startItem}</span> -{' '}
          <span className="text-[#F1F3F5] font-semibold">{endItem}</span> of{' '}
          <span className="text-[#F1F3F5] font-semibold">{totalItems}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 font-mono text-[11px]">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 rounded bg-[#1F2736] border border-[#273142] text-[#F1F3F5] hover:bg-[#273142] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1 rounded bg-[#1F2736] border border-[#273142] text-[#F1F3F5] hover:bg-[#273142] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Next Page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
