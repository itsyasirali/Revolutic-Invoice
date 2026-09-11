import React from "react";

interface TableSkeletonProps {
  title?: string;
  columns?: number;
  rows?: number;
}

export const TableSkeleton = ({
  title,
  columns = 5,
  rows = 5,
}: TableSkeletonProps) => {
  return (
    <div className="pb-8 w-full animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 pt-1">
        <div className="h-7 w-36 bg-slate-200 rounded animate-pulse">
          {title && <span className="sr-only">{title}</span>}
        </div>
        <div className="h-9 w-28 bg-slate-200 rounded-md animate-pulse" />
      </div>

      {/* Table Frame Skeleton */}
      <div className="mt-4 w-full bg-white border border-slate-200/80 rounded-t-md overflow-hidden">
        {/* Table Head */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center gap-4">
          <div className="w-4 h-4 rounded bg-slate-200 animate-pulse shrink-0" />
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={`th-${i}`}
              className="h-3.5 bg-slate-200 rounded animate-pulse"
              style={{
                width: i === 0 ? "25%" : i === 1 ? "15%" : i === 2 ? "20%" : "15%",
              }}
            />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div
              key={`row-${rIdx}`}
              className="px-4 py-3.5 flex items-center gap-4 hover:bg-slate-50/50"
            >
              <div className="w-4 h-4 rounded bg-slate-100 animate-pulse shrink-0" />
              {Array.from({ length: columns }).map((_, cIdx) => (
                <div
                  key={`cell-${cIdx}`}
                  className="h-4 bg-slate-100 rounded animate-pulse"
                  style={{
                    width:
                      cIdx === 0
                        ? "45%"
                        : cIdx === 1
                          ? "20%"
                          : cIdx === 2
                            ? "25%"
                            : "15%",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
