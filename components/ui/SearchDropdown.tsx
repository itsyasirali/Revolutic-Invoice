"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import type { SearchDropdownProps, SearchResultItem } from "@/types/common";
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
  const router = useRouter();
  const [internalQuery, setInternalQuery] = useState(value ?? "");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const query = value !== undefined ? value : internalQuery;

  // Sync internal state when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalQuery(value);
    }
  }, [value]);

  // Handle outside click & escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Perform search either via static items or onSearch handler
  const executeSearch = useCallback(
    async (searchTerm: string) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) {
        setResults([]);
        setIsOpen(false);
        setLoading(false);
        return;
      }

      if (onSearch) {
        setLoading(true);
        try {
          const res = await onSearch(trimmed);
          setResults(res || []);
          setIsOpen(true);
          setActiveIndex(-1);
        } catch (err) {
          console.error("[SearchDropdown] Search error:", err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else if (items) {
        const lower = trimmed.toLowerCase();
        const filtered = items.filter((item) => {
          return (
            item.title.toLowerCase().includes(lower) ||
            item.subtitle?.toLowerCase().includes(lower) ||
            item.category?.toLowerCase().includes(lower)
          );
        });
        setResults(filtered);
        setIsOpen(true);
        setActiveIndex(-1);
      }
    },
    [onSearch, items]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (value === undefined) {
      setInternalQuery(val);
    }
    onChange?.(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      executeSearch(val);
    }, 250);
  };

  const handleClear = () => {
    if (value === undefined) {
      setInternalQuery("");
    }
    onChange?.("");
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleItemSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (onSelect) {
      onSelect(item);
    } else if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "ArrowDown" && query.trim()) {
        executeSearch(query);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleItemSelect(results[activeIndex]);
      }
    }
  };

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
          onFocus={() => {
            if (query.trim() && results.length > 0) {
              setIsOpen(true);
            }
          }}
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
