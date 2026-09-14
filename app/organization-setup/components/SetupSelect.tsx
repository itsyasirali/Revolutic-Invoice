import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import type { SetupSelectProps } from "@/types/organization";

export const SetupSelect = forwardRef<HTMLSelectElement, SetupSelectProps>(
  ({ options, className = "", error = false, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`w-full h-11 pl-3.5 pr-10 rounded-lg border bg-white text-sm text-slate-800 appearance-none focus:outline-none transition-all cursor-pointer ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary hover:border-slate-400"
          } ${className}`}
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lbl = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4 stroke-[2]" />
        </div>
      </div>
    );
  },
);

SetupSelect.displayName = "SetupSelect";

export default SetupSelect;
