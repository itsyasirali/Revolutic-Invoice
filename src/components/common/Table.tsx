// Table.tsx
import { ArrowUpDown } from 'lucide-react';
import type { TableProps } from '../../types/common';


function Table<T>({
  columns,
  data,
  selectedIds,
  onSelectAll,
  onSelectRow,
  loading = false,
  emptyMessage = 'No data found',
  getRowId,
  onRowClick,
  rowActions,
  showCheckbox = true,
  sortKey,
  sortDirection,
  onSortChange,
}: TableProps<T>) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* ---------- HEAD ---------- */}
          <thead className="bg-gray-200 border-b border-gray-200">
            <tr>
              {showCheckbox && (
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary border-slate-300 rounded-md cursor-pointer accent-primary"
                  />
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-4 text-sm font-semibold text-slate-900 ${column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                    }`}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <button
                        type="button"
                        className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                        onClick={() => onSortChange?.(column.key)}
                      >
                        <ArrowUpDown
                          size={12}
                          className={`transition-all duration-200 ${column.key === sortKey
                            ? sortDirection === "asc"
                              ? "text-primary -translate-y-[1px]"
                              : "text-primary rotate-180 translate-y-[1px]"
                            : "text-slate-400 group-hover/sort:text-slate-600"
                            }`}
                        />
                      </button>
                    )}
                  </div>
                </th>
              ))}

              {rowActions && (
                <th className="px-4 py-4 text-sm font-semibold text-slate-900 text-center uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* ---------- BODY ---------- */}
          <tbody className="divide-y divide-slate-100">
            {/* Loading */}
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (showCheckbox ? 1 : 0) + (rowActions ? 1 : 0)
                  }
                  className="px-4 py-10 text-center"
                >
                  <div className="inline-flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 border-4 border-gray-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-10 h-10 border-4 border-gray-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-xs text-gray-600">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              /* Empty State */
              <tr>
                <td
                  colSpan={
                    columns.length + (showCheckbox ? 1 : 0) + (rowActions ? 1 : 0)
                  }
                  className="px-4 py-10 text-center"
                >
                  <div className="inline-flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              /* Table Rows */
              data.map((item) => {
                const id = getRowId(item);
                const isSelected = selectedIds.includes(id);

                return (
                  <tr
                    key={id}
                    className={`transition-all duration-150 group ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                      } ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {showCheckbox && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            onSelectRow(id, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-primary border-slate-300 rounded-md cursor-pointer accent-primary"
                        />
                      </td>
                    )}

                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-4 text-base text-slate-600 ${column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                          }`}
                      >
                        {column.render
                          ? column.render(item)
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          : String((item as any)[column.key] || '')}
                      </td>
                    ))}

                    {rowActions && (
                      <td className="px-4 py-4 text-center">
                        <div
                          className="inline-flex transition-all duration-200"
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
    </div>
  );
}

export default Table;
