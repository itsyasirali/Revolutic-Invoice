import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { SetupHeaderProps } from "@/types/organization";

export const SetupHeader: React.FC<SetupHeaderProps> = ({
  onClose,
  brandName = "Invoice",
  subBrand = "Smarty",
  title = "Organization Setup",
}) => {
  return (
    <div className="bg-[#f0f5fa] px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-slate-200/80">
      {/* Brand & Section */}
      <div className="flex items-center gap-3">
        {/* Invoice Smarty Logo Badge */}
        <div className="w-10 h-10">
          <Image
            src="/assets/InvoiceSmartyIcon.png"
            alt="Invoice Smarty"
            width={28}
            height={28}
            className="w-10 h-10 object-contain rounded-md"
          />
        </div>

        {/* Brand Text */}
        <div className="flex flex-col leading-none">
          <span className="text-[14px] font-bold tracking-tight text-slate-700 uppercase">
            {brandName}
          </span>
          <span className="text-[14px] font-extrabold tracking-tight text-primary">
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
