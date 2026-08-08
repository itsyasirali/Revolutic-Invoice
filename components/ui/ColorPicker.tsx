"use client";

import React from "react";

export interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-2.5">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-md border border-slate-300 cursor-pointer p-1 bg-white shadow-sm hover:border-primary transition-colors shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase"
          placeholder="#000000"
        />
      </div>
      {error && (
        <span className="text-xs text-rose-500 font-medium">{error}</span>
      )}
    </div>
  );
};

export default ColorPicker;
