"use client";

import React from "react";
import type { SwitchProps } from "@/types/common";

const containerSizes = {
  sm: "w-8 h-4.5 p-0.5",
  md: "w-11 h-6 p-0.5",
  lg: "w-14 h-7.5 p-1",
};

const thumbSizes = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-5.5 h-5.5",
};

const translateSizes = {
  sm: "translate-x-3.5",
  md: "translate-x-5",
  lg: "translate-x-6.5",
};

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className = "",
}) => {
  return (
    <label
      className={`inline-flex items-center gap-3 select-none cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex items-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 ${containerSizes[size]} ${checked ? "bg-primary" : "bg-slate-300 hover:bg-slate-400/80"}`}
      >
        <span
          className={`inline-block rounded-md bg-white shadow-md transform transition-transform duration-200 ease-in-out ${thumbSizes[size]} ${checked ? translateSizes[size] : "translate-x-0"}`}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && (
            <span className="text-sm font-medium text-slate-800">{label}</span>
          )}
          {description && (
            <span className="text-xs text-slate-500">{description}</span>
          )}
        </div>
      )}
    </label>
  );
};

export default Switch;
