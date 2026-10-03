"use client";

import React from "react";
import { Input } from "./Input";
import { Select } from "./Select";
import { Button } from "./Button";
import type { SelectOption } from "@/types/common";

export interface FilterField {
  key: string;
  label: string;
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
}

export interface DateRange {
  from: string;
  to: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterField[];
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

/** Search + filter row shared by Expenses, Time Tracking and Quotes. */
export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  filters,
  dateRange,
  onDateRangeChange,
  onClear,
  hasActiveFilters,
}) => (
  <div className="px-2 sm:px-4 md:px-6 mt-4">
    <div className="flex flex-wrap items-end gap-3 bg-white border border-slate-200/80 rounded-md p-3">
      <div className="w-full sm:w-64">
        <Input
          type="search"
          label="Search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          inputSize="sm"
          fullWidth
        />
      </div>
      {filters.map((f) => (
        <div key={f.key} className="w-full sm:w-44">
          <Select
            label={f.label}
            selectSize="sm"
            options={f.options}
            value={f.value}
            onValueChange={f.onChange}
            searchable={false}
          />
        </div>
      ))}
      {dateRange && onDateRangeChange && (
        <>
          <div className="w-[calc(50%-6px)] sm:w-40">
            <Input
              type="date"
              label="From"
              value={dateRange.from}
              onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
              inputSize="sm"
              fullWidth
            />
          </div>
          <div className="w-[calc(50%-6px)] sm:w-40">
            <Input
              type="date"
              label="To"
              value={dateRange.to}
              onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
              inputSize="sm"
              fullWidth
            />
          </div>
        </>
      )}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  </div>
);

export default FilterBar;
