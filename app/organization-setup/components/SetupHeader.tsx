"use client";

import React from "react";
import { X, FileText } from "lucide-react";

interface SetupHeaderProps {
  onClose?: () => void;
  brandName?: string;
  subBrand?: string;
  title?: string;
}

export const SetupHeader: React.FC<SetupHeaderProps> = ({
  onClose,
  brandName = "Revolutic",
  subBrand = "Invoice",
  title = "Organization Setup",
}) => {
  return (
    <div className="bg-[#f0f5fa] px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-slate-200/80">
      {/* Brand & Section */}
      <div className="flex items-center gap-3">
        {/* Invoice Icon Badge */}
        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-primary shadow-2xs">
          <FileText className="w-5 h-5 stroke-[2.2]" />
        </div>

        {/* Brand Text */}
        <div className="flex flex-col leading-none">
          <span className="text-[11px] font-bold tracking-tight text-slate-700 uppercase">
            {brandName}
          </span>
          <span className="text-sm font-extrabold tracking-tight text-slate-900">
            {subBrand}
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1.5px] bg-slate-300 mx-1 sm:mx-2" />

        {/* Page Title */}
        <span className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight">
          {title}
        </span>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};

export default SetupHeader;
