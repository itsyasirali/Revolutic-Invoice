"use client";

import React from "react";
import { Search, X, ArrowRight } from "lucide-react";
import type { SearchDropdownProps } from "@/types/common";
import useSearchDropdown from "@/hooks/common/useSearchDropdown";
import { Badge } from "./Badge";
import { LoadingSpinner } from "./LoadingSpinner";

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  items,
  onSelect,
  className = "",
  dropdownWidth = "w-80 sm:w-96",
  emptyMessage = "No results found",
  autoFocus = false,
}) => {
  const {
    query,
    results,
    loading,
    isOpen,
    activeIndex,
    setActiveIndex,
    containerRef,
    inputRef,
    handleInputChange,
    handleFocus,
    handleClear,
    handleItemSelect,
    handleKeyDown,
  } = useSearchDropdown({ value, onChange, onSearch, items, onSelect });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-700 placeholder-slate-400 text-xs rounded-md pl-10 pr-8 py-2 outline-none border border-slate-200/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all shadow-2xs"
        />

        {/* Clear or Loading Icon */}
        <div className="absolute right-2.5 flex items-center">
          {loading ? (
            <LoadingSpinner size="xs" color="gray" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Floating Results Dropdown List */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 ${dropdownWidth} max-w-[90vw] bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header Info */}
          <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>Search Results</span>
            <span>
              {results.length} {results.length === 1 ? "match" : "matches"}
            </span>
          </div>

          {/* List Content */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100/80 scrollbar-thin scrollbar-thumb-slate-200">
            {results.length === 0 && !loading ? (
              <div className="px-4 py-6 text-center text-slate-500">
                <Search className="w-6 h-6 text-slate-300 mx-auto mb-1.5 opacity-60" />
                <p className="text-xs font-medium text-slate-600">
                  {emptyMessage}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              results.map((item, index) => {
                const ItemIcon = item.icon;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={`${item.id}-${index}`}
                    type="button"
                    onClick={() => handleItemSelect(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isActive ? "bg-primary/5 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {ItemIcon && (
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <ItemIcon className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {item.title}
                          </p>
                          {item.category && (
                            <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.2 bg-slate-100 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>

                        {item.subtitle && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <Badge
                          variant={item.badgeVariant || "default"}
                          size="sm"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
