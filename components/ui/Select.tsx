"use client";

import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import type {
  SelectProps,
  SelectVariant,
  SelectSize,
  SelectOption,
} from "@/types/common";
import { ChevronDown, Search, Check } from "lucide-react";

const variantClasses: Record<SelectVariant, string> = {
  default:
    "bg-white border border-slate-300 hover:border-slate-400 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-md shadow-2xs",
  outline:
    "bg-transparent border-2 border-slate-300 hover:border-slate-400 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-md",
  filled:
    "bg-slate-100 border border-slate-200 hover:border-slate-300 focus-within:bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-md",
};

const sizeClasses: Record<SelectSize, string> = {
  sm: "h-9 text-xs",
  md: "h-11 text-sm",
  lg: "h-12 text-base",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      variant = "default",
      selectSize = "md",
      label,
      labelClassName,
      error,
      helperText,
      options = [],
      placeholder = "Select an option",
      fullWidth = true,
      showLabel = true,
      leftIcon: LeftIcon,
      searchable = true,
      searchPlaceholder = "Search",
      className = "",
      disabled = false,
      value,
      defaultValue,
      onChange,
      onValueChange,
      name,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    // Normalize options into { label, value, disabled? }
    const normalizedOptions: SelectOption[] = useMemo(() => {
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

    const hasError = Boolean(error);
    const errorMsg = typeof error === "string" ? error : undefined;

    const errorContainerClass = hasError
      ? "border-red-400 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
      : "";

    const widthClass = fullWidth ? "w-full" : "w-auto";

    return (
      <div
        ref={containerRef}
        className={`relative flex flex-col gap-1.5 ${widthClass}`}
      >
        {/* Label */}
        {label && showLabel && (
          <label
            htmlFor={selectId}
            className={
              labelClassName ||
              "block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            }
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Custom Trigger Button (Image 1 & 2 matching height h-11, rounded-md) */}
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              if (isOpen) setSearchTerm("");
            }
          }}
          className={`w-full px-3.5 flex items-center justify-between text-left transition-all cursor-pointer ${
            variantClasses[variant]
          } ${sizeClasses[selectSize]} ${errorContainerClass} ${
            isOpen ? "border-primary ring-1 ring-primary" : ""
          } ${
            disabled ? "opacity-60 bg-slate-100 cursor-not-allowed" : ""
          } ${className}`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            {LeftIcon && (
              <div className="text-slate-400 shrink-0">
                <LeftIcon className="w-4 h-4" />
              </div>
            )}
            <span
              className={`truncate ${
                selectedOption
                  ? "text-slate-800 font-normal"
                  : "text-slate-400"
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <div className="text-slate-400 shrink-0 transition-transform duration-200">
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-primary" : ""
              }`}
            />
          </div>
        </button>

        {/* Hidden native select for HTML form submissions, refs & accessibility */}
        <select
          ref={ref}
          name={name}
          value={currentValue}
          onChange={() => {}}
          disabled={disabled}
          required={props.required}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only pointer-events-none absolute opacity-0"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Floating Dropdown Popover (Image 2 style) */}
        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-md border border-slate-200 shadow-lg p-2 animate-in fade-in-50 zoom-in-95 duration-100">
            {/* Top Search Input (Matches Image 2 blue-bordered search box) */}
            {searchable && (
              <div className="relative mb-2 flex items-center rounded-md border border-primary ring-1 ring-primary/20 px-2.5 py-1.5 bg-white">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                />
              </div>
            )}

            {/* Scrollable Options List */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 dropdown-scrollbar pr-0.5">
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 font-medium">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected =
                    String(option.value) === String(currentValue);
                  const hasDetails = Boolean(
                    option.avatar ||
                      option.subtitle ||
                      option.description ||
                      option.icon,
                  );

                  return (
                    <div
                      key={option.value}
                      onClick={() => {
                        if (!option.disabled) {
                          handleSelect(option.value);
                        }
                      }}
                      className={`px-3 py-2 text-sm rounded-md flex items-center justify-between cursor-pointer transition-colors ${
                        option.disabled
                          ? "opacity-50 cursor-not-allowed text-slate-400"
                          : isSelected
                            ? "bg-primary text-white font-medium shadow-2xs"
                            : "text-slate-700 hover:bg-slate-100 active:bg-slate-200"
                      }`}
                    >
                      {hasDetails ? (
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {option.avatar ? (
                            <div className="shrink-0">{option.avatar}</div>
                          ) : option.icon ? (
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              <option.icon className="w-4 h-4" />
                            </div>
                          ) : null}

                          <div className="min-w-0 flex-1">
                            <div
                              className={`truncate text-sm ${
                                isSelected
                                  ? "text-white font-semibold"
                                  : "text-slate-900 font-medium"
                              }`}
                            >
                              {option.label}
                            </div>
                            {(option.subtitle || option.description) && (
                              <div
                                className={`text-xs truncate mt-0.5 flex items-center gap-1.5 ${
                                  isSelected
                                    ? "text-white/90"
                                    : "text-slate-500"
                                }`}
                              >
                                {option.subtitle || option.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="truncate">{option.label}</span>
                      )}

                      {isSelected && (
                        <Check className="w-4 h-4 text-white shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <p className="text-xs text-red-500 font-medium mt-0.5">{errorMsg}</p>
        )}

        {/* Helper text */}
        {helperText && !hasError && (
          <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
