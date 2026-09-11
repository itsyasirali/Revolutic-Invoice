import React from "react";
import type { LoadingSpinnerProps } from "@/types/common";

const sizeMap = {
  xs: { dot: "w-1 h-1", gap: "gap-1" },
  sm: { dot: "w-1.5 h-1.5", gap: "gap-1.5" },
  md: { dot: "w-2 h-2", gap: "gap-2" },
  lg: { dot: "w-2.5 h-2.5", gap: "gap-2.5" },
};

const colorMap = {
  primary: "bg-primary",
  white: "bg-white",
  gray: "bg-slate-400",
  current: "bg-current",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const currentSize = sizeMap[size] || sizeMap.md;
  const currentColor = colorMap[color] || colorMap.primary;

  return (
    <div
      className={`inline-flex items-center justify-center ${currentSize.gap} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span
        className={`${currentSize.dot} ${currentColor} rounded-full animate-dot-bounce`}
        style={{ animationDelay: "-0.32s" }}
      />
      <span
        className={`${currentSize.dot} ${currentColor} rounded-full animate-dot-bounce`}
        style={{ animationDelay: "-0.16s" }}
      />
      <span
        className={`${currentSize.dot} ${currentColor} rounded-full animate-dot-bounce`}
        style={{ animationDelay: "0s" }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const ThreeDotLoader = LoadingSpinner;
export default LoadingSpinner;
