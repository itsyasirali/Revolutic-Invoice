"use client";

import React from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export interface PageHeaderProps {
  title: string;
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
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  actions,
  className = "",
  dropdown,
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
    <div className={`${className}`}>
      <div className="py-4 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                      <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-xl py-1.5 z-20 animate-reveal">
                        {dropdown.options.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              dropdown.onChange(opt.value);
                              dropdown.onToggle();
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
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
      </div>
    </div>
  );
};

export default PageHeader;
