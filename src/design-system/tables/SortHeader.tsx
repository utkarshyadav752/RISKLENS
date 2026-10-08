import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SortHeaderProps {
  label: string;
  field: string;
  currentSortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const SortHeader: React.FC<SortHeaderProps> = ({
  label,
  field,
  currentSortField,
  sortDirection,
  onSort,
  align = 'left',
  className
}) => {
  const isSorted = currentSortField === field;

  const ariaSortValue = isSorted
    ? sortDirection === 'asc' ? 'ascending' : 'descending'
    : 'none';

  return (
    <th
      scope="col"
      aria-sort={ariaSortValue}
      className={cn('p-2.5 text-xs font-semibold text-[#94A3B8] select-none', className)}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          'inline-flex items-center gap-1.5 group hover:text-[#F1F3F5] transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -mx-1',
          align === 'right' ? 'ml-auto flex-row-reverse' : align === 'center' ? 'mx-auto' : ''
        )}
      >
        <span>{label}</span>
        <span className="text-[#64748B] group-hover:text-[#F1F3F5]">
          {isSorted ? (
            sortDirection === 'asc' ? <ArrowUp size={13} className="text-blue-400 stroke-[2.5]" /> : <ArrowDown size={13} className="text-blue-400 stroke-[2.5]" />
          ) : (
            <ArrowUpDown size={12} className="opacity-40 group-hover:opacity-100" />
          )}
        </span>
      </button>
    </th>
  );
};
