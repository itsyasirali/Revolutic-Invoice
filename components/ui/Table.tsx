"use client";

import type { TableProps, TableVariant } from '@/types/common';
import { ArrowUpDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import Checkbox from './Checkbox';

const variantTableClasses: Record<TableVariant, { table: string; th: string; td: string; tr: string }> = {
    default: {
        table: 'w-full bg-white border border-slate-200/80 rounded-t-xl rounded-b-none shadow-sm overflow-hidden',
        th: 'bg-slate-50 border-b border-slate-200/80 text-slate-700 font-semibold text-xs uppercase tracking-wider',
        td: 'border-b border-slate-100 text-sm text-slate-700',
        tr: 'hover:bg-slate-50/60 transition-colors',
    },
    striped: {
        table: 'w-full bg-white border border-slate-200/80 rounded-t-xl rounded-b-none shadow-sm overflow-hidden',
        th: 'bg-slate-100 border-b border-slate-200 text-slate-800 font-semibold text-xs uppercase tracking-wider',
        td: 'border-b border-slate-100 text-sm text-slate-700',
        tr: 'odd:bg-white even:bg-slate-50/80 hover:bg-slate-100/60 transition-colors',
    },
    bordered: {
        table: 'w-full bg-white border-2 border-slate-300 rounded-t-xl rounded-b-none shadow-sm overflow-hidden',
        th: 'bg-slate-100 border-b-2 border-r border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider last:border-r-0',
        td: 'border-b border-r border-slate-200 text-sm text-slate-700 last:border-r-0',
        tr: 'hover:bg-slate-50 transition-colors',
    },
    compact: {
        table: 'w-full bg-white border border-slate-200 rounded-t-lg rounded-b-none shadow-none overflow-hidden',
        th: 'bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-[11px] uppercase tracking-wider',
        td: 'border-b border-slate-100 text-xs text-slate-700 py-2.5',
        tr: 'hover:bg-slate-50/50 transition-colors',
    },
};

export const Table = <T,>({
    columns,
    data = [],
    selectedIds = [],
    onSelectAll,
    onSelectRow,
    loading = false,
    emptyMessage = 'No data found',
    emptyIcon: EmptyIcon = Inbox,
    getRowId = (item: unknown) => ((item as Record<string, unknown>)?.id || (item as Record<string, unknown>)?.key) as string | number,
    onRowClick,
    rowActions,
    showCheckbox = true,
    sortKey,
    sortDirection,
    onSortChange,
    variant = 'default',
    pagination,
    className = '',
}: TableProps<T>) => {
    const allSelected = data.length > 0 && selectedIds.length === data.length;
    const someSelected = selectedIds.length > 0 && !allSelected;
    const styles = variantTableClasses[variant];

    return (
        <div className={`${styles.table} ${className}`}>
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                    {/* Header */}
                    <thead className={styles.th}>
                        <tr>
                            {showCheckbox && (
                                <th className="px-4 py-3.5 w-10 text-center shrink-0">
                                    <Checkbox
                                        checked={allSelected}
                                        ref={(input) => {
                                            if (input) input.indeterminate = someSelected;
                                        }}
                                        onChange={(e) => onSelectAll?.(e.target.checked)}
                                    />
                                </th>
                            )}

                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3.5 ${column.align === 'center'
                                            ? 'text-center'
                                            : column.align === 'right'
                                                ? 'text-right'
                                                : 'text-left'
                                        } ${column.className || ''}`}
                                    style={{ width: column.width }}
                                >
                                    <div
                                        className={`inline-flex items-center gap-1.5 ${column.sortable ? 'cursor-pointer select-none group/sort' : ''
                                            }`}
                                        onClick={() => column.sortable && onSortChange?.(column.key)}
                                    >
                                        <span>{column.label}</span>
                                        {column.sortable && (
                                            <button
                                                type="button"
                                                className="p-0.5 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSortChange?.(column.key);
                                                }}
                                            >
                                                <ArrowUpDown
                                                    className={`w-3.5 h-3.5 transition-all duration-200 ${column.key === sortKey
                                                            ? sortDirection === 'asc'
                                                                ? 'text-primary -translate-y-[1px]'
                                                                : 'text-primary rotate-180 translate-y-[1px]'
                                                            : 'text-slate-400 group-hover/sort:text-slate-600'
                                                        }`}
                                                />
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}

                            {rowActions && (
                                <th className="px-4 py-3.5 text-center uppercase tracking-wider shrink-0">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showCheckbox ? 1 : 0) + (rowActions ? 1 : 0)}
                                    className="px-4 py-12 text-center"
                                >
                                    <div className="inline-flex flex-col items-center justify-center gap-3">
                                        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <p className="text-xs font-medium text-slate-500">Loading data...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showCheckbox ? 1 : 0) + (rowActions ? 1 : 0)}
                                    className="px-4 py-12 text-center"
                                >
                                    <div className="inline-flex flex-col items-center justify-center gap-2">
                                        <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
                                            <EmptyIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => {
                                const id = getRowId(item) ?? index;
                                const isSelected = selectedIds.includes(id);

                                return (
                                    <tr
                                        key={id}
                                        onClick={() => onRowClick?.(item)}
                                        className={`${styles.tr} ${isSelected ? 'bg-primary/5' : ''} ${onRowClick ? 'cursor-pointer' : ''
                                            }`}
                                    >
                                        {showCheckbox && (
                                            <td className="px-4 py-3 text-center">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        onSelectRow?.(id, e.target.checked);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                        )}

                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={`px-4 py-3.5 ${styles.td} ${column.align === 'center'
                                                        ? 'text-center'
                                                        : column.align === 'right'
                                                            ? 'text-right'
                                                            : 'text-left'
                                                    }`}
                                            >
                                                {column.render
                                                    ? column.render(item)
                                                    : String((item as Record<string, unknown>)[column.key] ?? '')}
                                            </td>
                                        ))}

                                        {rowActions && (
                                            <td className="px-4 py-3.5 text-center">
                                                <div
                                                    className="inline-flex items-center justify-center gap-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {rowActions(item)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/60 text-xs text-slate-600">
                    <div>
                        {pagination.totalItems !== undefined && (
                            <span>
                                Total <strong>{pagination.totalItems}</strong> entries
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span>
                            Page <strong>{pagination.currentPage}</strong> of{' '}
                            <strong>{pagination.totalPages}</strong>
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={pagination.currentPage <= 1}
                                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                                className="p-1 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                disabled={pagination.currentPage >= pagination.totalPages}
                                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                                className="p-1 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Table;
