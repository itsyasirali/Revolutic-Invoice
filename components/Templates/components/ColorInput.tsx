import React from "react";
import { getSafeHex } from "@/utils/templates/colorUtils";
import type { ColorInputProps } from "@/types/template";
import { Input } from "@/components/ui";

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
      <Input
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
        showLabel={false}
        fullWidth
        className="font-mono uppercase"
      />
    </div>
  </div>
);

export default ColorInput;
