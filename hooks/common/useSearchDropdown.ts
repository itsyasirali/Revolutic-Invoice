"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import type {
  UseSearchDropdownProps,
  UseSearchDropdownReturn,
  SearchResultItem,
} from "@/types/common";

const useSearchDropdown = ({
  value,
  onChange,
  onSearch,
  items,
  onSelect,
}: UseSearchDropdownProps): UseSearchDropdownReturn => {
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

  const handleFocus = () => {
    if (query.trim() && results.length > 0) {
      setIsOpen(true);
    }
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

  return {
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
  };
};

export default useSearchDropdown;
