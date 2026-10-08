import React, { useState } from 'react';
import { RefreshCw, Maximize2, Minimize2, MoreVertical } from 'lucide-react';
import { cn } from '../../utils/cn';

interface WidgetCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footerStatus?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onRefresh?: () => void;
  collapsible?: boolean;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  id,
  title,
  subtitle,
  headerAction,
  footerStatus,
  children,
  className,
  onRefresh,
  collapsible = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <section
      id={id}
      aria-label={title}
      className={cn(
        'bg-[#151B26]/85 backdrop-blur-md border border-[#273142]/80 rounded-xl flex flex-col justify-between transition-all duration-200 relative overflow-hidden shadow-lg shadow-black/25 hover:border-blue-500/35',
        isExpanded && 'fixed inset-4 z-50 bg-[#151B26]/95 backdrop-blur-xl border-blue-500 shadow-2xl overflow-y-auto',
        className
      )}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#273142]/60 select-none">
        <div className="flex flex-col min-w-0 pr-2">
          <h2 className="text-xs font-semibold text-[#F1F3F5] tracking-tight truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-[#64748B] truncate mt-0.5 font-mono">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {headerAction}

          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1 rounded text-[#64748B] hover:text-[#F1F3F5] hover:bg-[#1F2736] transition-colors"
              aria-label="Refresh widget data"
            >
              <RefreshCw size={13} className={cn(isRefreshing && 'animate-spin text-blue-400')} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-[#64748B] hover:text-[#F1F3F5] hover:bg-[#1F2736] transition-colors"
            aria-label={isExpanded ? 'Collapse widget' : 'Expand widget to full screen'}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {children}
      </div>

      {/* Optional Card Footer Status */}
      {footerStatus && (
        <div className="px-4 py-2 border-t border-[#273142]/60 bg-[#0B0E14]/40 text-[11px] font-mono text-[#64748B] flex items-center justify-between">
          {footerStatus}
        </div>
      )}
    </section>
  );
};
