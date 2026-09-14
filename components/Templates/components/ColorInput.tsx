import React from "react";
import { getSafeHex } from "@/utils/templates/colorUtils";
import type { ColorInputProps } from "@/types/template";

export const ColorInput: React.FC<ColorInputProps> = ({
  label,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="flex items-center gap-2.5">
      <input
        type="color"
        value={getSafeHex(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-md border-2 border-gray-300 cursor-pointer shadow-sm hover:border-primary/50"
        title={value || "#000000"}
      />
      <input
        type="text"
        value={(value || "").toUpperCase()}
        onChange={(e) =>
          onChange(
            e.target.value.startsWith("#")
              ? e.target.value
              : `#${e.target.value}`,
          )
        }
        placeholder="#000000"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono text-gray-900 uppercase focus:ring-2 focus:ring-primary/50 focus:border-primary/60"
      />
    </div>
  </div>
);

export default ColorInput;
