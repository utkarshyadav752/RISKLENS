import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbBarProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb navigation" className={cn('flex items-center text-xs font-mono', className)}>
      <ol className="flex items-center space-x-1.5">
        <li className="flex items-center">
          <span className="flex items-center text-[#64748B] hover:text-[#94A3B8] transition-colors">
            <Home size={13} className="mr-1" />
            <span>RiskLens</span>
          </span>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight size={12} className="text-[#64748B] mx-1 shrink-0" aria-hidden="true" />
            {item.isCurrent ? (
              <span
                aria-current="page"
                className="text-[#F1F3F5] font-semibold tracking-tight"
              >
                {item.label}
              </span>
            ) : (
              <span className="text-[#94A3B8] hover:text-[#F1F3F5] transition-colors cursor-pointer">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
