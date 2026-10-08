import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { SortHeader } from './SortHeader';
import { TableFilterBar } from './TableFilterBar';
import { PaginationBar } from './PaginationBar';
import { ColumnVisibilityDropdown, type ColumnDefinition } from './ColumnVisibilityDropdown';
import { TableCellMono } from './TableCellMono';
import { RowActionMenu } from './RowActionMenu';
import { RiskBadge } from '../primitives/RiskBadge';
import { LimitUsageBar } from '../visualizations/LimitUsageBar';
import type { SeverityLevel } from '../../types/risk';

export interface DataColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  keyField: keyof T;
  searchFields?: (keyof T)[];
  title?: string;
  onRowClick?: (row: T) => void;
  onInspectRow?: (row: T) => void;
  onEscalateRow?: (row: T) => void;
  onAcknowledgeRow?: (row: T) => void;
  initialPageSize?: number;
  className?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  keyField,
  searchFields,
  title,
  onRowClick,
  onInspectRow,
  onEscalateRow,
  onAcknowledgeRow,
  initialPageSize = 5,
  className
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Column visibility state
  const [colVisibility, setColVisibility] = useState<ColumnDefinition[]>(
    columns.map(c => ({ key: c.key, label: c.label, visible: true }))
  );

  const handleToggleColumn = (key: string) => {
    setColVisibility(prev =>
      prev.map(c => (c.key === key ? { ...c, visible: !c.visible } : c))
    );
  };

  const visibleColumnKeys = useMemo(
    () => new Set(colVisibility.filter(c => c.visible).map(c => c.key)),
    [colVisibility]
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField('');
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const itemRecord = item as Record<string, any>;
      // Severity filter
      if (selectedSeverity !== 'all' && 'severity' in itemRecord) {
        if (itemRecord.severity !== selectedSeverity) return false;
      }

      // Asset Class filter
      if (selectedAssetClass !== 'all' && 'assetClass' in itemRecord) {
        if (itemRecord.assetClass !== selectedAssetClass) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (searchFields && searchFields.length > 0) {
          const match = searchFields.some(field => {
            const val = itemRecord[field as string];
            return val ? String(val).toLowerCase().includes(query) : false;
          });
          if (!match) return false;
        } else {
          // Default to searching all string/number fields
          const match = Object.values(itemRecord).some(val =>
            val ? String(val).toLowerCase().includes(query) : false
          );
          if (!match) return false;
        }
      }

      return true;
    });
  }, [data, selectedSeverity, selectedAssetClass, searchQuery, searchFields]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, any>)[sortField];
      const bVal = (b as Record<string, any>)[sortField];

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortField, sortDirection]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div className={cn('flex flex-col w-full', className)}>
      <div className="flex items-center justify-between pb-2">
        {title && <span className="font-semibold text-sm text-[#F1F3F5]">{title}</span>}
        <div className="ml-auto">
          <ColumnVisibilityDropdown
            columns={colVisibility}
            onToggleColumn={handleToggleColumn}
          />
        </div>
      </div>

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={q => { setSearchQuery(q); setCurrentPage(1); }}
        selectedSeverity={selectedSeverity}
        onSeverityChange={s => { setSelectedSeverity(s); setCurrentPage(1); }}
        selectedAssetClass={selectedAssetClass}
        onAssetClassChange={a => { setSelectedAssetClass(a); setCurrentPage(1); }}
      />

      <div className="overflow-x-auto rounded-lg border border-[#273142] bg-[#0B0E14]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#273142] bg-[#151B26]">
              {columns
                .filter(col => visibleColumnKeys.has(col.key))
                .map(col =>
                  col.sortable ? (
                    <SortHeader
                      key={col.key}
                      label={col.label}
                      field={col.key}
                      currentSortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      align={col.align}
                    />
                  ) : (
                    <th
                      key={col.key}
                      scope="col"
                      className={cn(
                        'p-2.5 text-xs font-semibold text-[#94A3B8]',
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      )}
                    >
                      {col.label}
                    </th>
                  )
                )}
              <th scope="col" className="p-2.5 text-xs font-semibold text-[#94A3B8] text-right w-12">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#273142]/40">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-8 text-center text-xs font-mono text-[#64748B]"
                >
                  No risk entries match the active criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={String(row[keyField]) || idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'hover:bg-[#151B26] transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns
                    .filter(col => visibleColumnKeys.has(col.key))
                    .map(col => (
                      <td
                        key={col.key}
                        className={cn(
                          'p-2.5 text-xs text-[#F1F3F5]',
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        )}
                      >
                        {col.render ? (
                          col.render(row)
                        ) : typeof (row as Record<string, any>)[col.key] === 'number' ? (
                          <TableCellMono value={(row as Record<string, any>)[col.key] as number} align={col.align} />
                        ) : col.key === 'severity' ? (
                          <RiskBadge severity={(row as Record<string, any>)[col.key] as SeverityLevel} size="sm" />
                        ) : (
                          String((row as Record<string, any>)[col.key] ?? '-')
                        )}
                      </td>
                    ))}

                  <td className="p-2.5 text-right w-12" onClick={e => e.stopPropagation()}>
                    <RowActionMenu
                      onInspect={() => onInspectRow?.(row)}
                      onEscalate={() => onEscalateRow?.(row)}
                      onAcknowledge={() => onAcknowledgeRow?.(row)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalItems={sortedData.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={s => { setPageSize(s); setCurrentPage(1); }}
      />
    </div>
  );
}
