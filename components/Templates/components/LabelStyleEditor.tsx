import React from "react";
import ColorInput from "./ColorInput";
import type { LabelStyleProps } from "@/types/template";
import { Input } from "@/components/ui";

export const LabelStyleEditor: React.FC<LabelStyleProps> = ({
  label,
  textValue,
  textColor = "#1f2937",
  bgColor = "transparent",
  fontSize = 10,
  onTextChange,
  onTextColorChange,
  onBgColorChange,
  onFontSizeChange,
  showColor = true,
  showBg = true,
  showSize = true,
}) => (
  <div className="space-y-3">
    <label className="block text-xs font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Text</label>
      <Input
        type="text"
        value={textValue}
        onChange={(e) => onTextChange(e.target.value)}
        showLabel={false}
        fullWidth
      />
    </div>

    {showColor && onTextColorChange && (
      <ColorInput
        label="Color"
        value={textColor}
        onChange={(v) => onTextColorChange(v)}
      />
    )}

    {showBg && onBgColorChange && (
      <ColorInput
        label="Background"
        value={bgColor === "transparent" ? "#ffffff" : bgColor}
        onChange={(v) => onBgColorChange(v)}
      />
    )}

    {showSize && (
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Size (pt)</label>
        <Input
          type="number"
          value={fontSize}
          onChange={(e) => onFontSizeChange?.(parseInt(e.target.value) || 10)}
          showLabel={false}
          fullWidth
        />
      </div>
    )}
  </div>
);

export default LabelStyleEditor;
