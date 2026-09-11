"use client";

import React from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
  dropdown?: {
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
    isOpen: boolean;
    onToggle: () => void;
  };
  actionBar?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  actions,
  className = "",
  dropdown,
  actionBar,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={`px-2 sm:px-4 md:px-6 relative ${className}`}>
      <div className="py-2 mx-auto">
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-150 ${
            actionBar
              ? "opacity-0 invisible pointer-events-none"
              : "opacity-100 visible"
          }`}
        >
          <div className="flex items-center gap-3.5">
            {showBackButton && (
              <button
                type="button"
                onClick={handleBack}
                className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-900 cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-wrap items-center gap-3.5">
              {dropdown ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={dropdown.onToggle}
                    className="flex items-center gap-2 text-xl font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{title}</span>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </button>

                  {dropdown.isOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={dropdown.onToggle}
                      />
                      <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-xl z-20">
                        {dropdown.options.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              dropdown.onChange(opt.value);
                              dropdown.onToggle();
                            }}
                            className={`w-full text-left px-4 py-2 text-sm font-medium cursor-pointer ${
                              dropdown.value === opt.value
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {title}
                </h1>
              )}

              {subtitle && (
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
          )}
        </div>

        {/* Overlapping Action Bar */}
        {actionBar && (
          <div className="absolute inset-x-2 sm:inset-x-4 md:inset-x-6 top-1/2 -translate-y-1/2 z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-full bg-primary/5 border border-primary/20 p-2.5 rounded-md flex items-center justify-between gap-4 shadow-xs">
              {actionBar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
