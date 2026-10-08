import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className
}) => {
  return (
    <div className={cn('relative flex items-center w-full', className)}>
      <Search size={14} className="absolute left-3 text-[#64748B] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#151B26] border border-[#273142] rounded-lg pl-9 pr-8 py-2 text-xs text-[#F1F3F5] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 p-0.5 text-[#64748B] hover:text-[#F1F3F5] rounded"
          aria-label="Clear search input"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};
