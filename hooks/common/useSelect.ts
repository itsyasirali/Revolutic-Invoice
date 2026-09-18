"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { UseSelectProps, UseSelectReturn } from "@/types/common";

const useSelect = ({
  options,
  value,
  defaultValue,
  onChange,
  onValueChange,
  name,
  selectId,
  searchable = true,
}: UseSelectProps): UseSelectReturn => {
  // Normalize options into { label, value, disabled? }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string" || typeof opt === "number") {
        return { label: String(opt), value: String(opt) };
      }
      return {
        ...opt,
        value: String(opt.value),
      };
    });
  }, [options]);

  // Internal value state for uncontrolled usage
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue !== undefined ? String(defaultValue) : "",
  );

  const currentValue = isControlled ? String(value ?? "") : internalValue;

  // Dropdown open/close & search state
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find current selected option
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(currentValue),
  );

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const lower = searchTerm.toLowerCase();
    return normalizedOptions.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(lower);
      const matchDesc =
        typeof opt.description === "string" &&
        opt.description.toLowerCase().includes(lower);
      return matchLabel || matchDesc;
    });
  }, [normalizedOptions, searchTerm]);

  // Handle outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && searchable) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (isOpen) setSearchTerm("");
  };

  const handleSelect = (optionVal: string | number) => {
    const strVal = String(optionVal);
    if (!isControlled) {
      setInternalValue(strVal);
    }
    setIsOpen(false);
    setSearchTerm("");

    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || selectId || "",
          value: strVal,
        },
        currentTarget: {
          name: name || selectId || "",
          value: strVal,
        },
      };
      onChange(syntheticEvent as unknown as React.ChangeEvent<HTMLSelectElement>);
    }

    if (onValueChange) {
      onValueChange(strVal);
    }
  };

  return {
    normalizedOptions,
    isOpen,
    toggleOpen,
    searchTerm,
    setSearchTerm,
    containerRef,
    searchInputRef,
    selectedOption,
    filteredOptions,
    currentValue,
    handleSelect,
  };
};

export default useSelect;
