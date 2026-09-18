import React from "react";
import type { LoadingSpinnerProps } from "@/types/common";

const sizeMap = {
  xs: "w-3 h-3 border-2",
  sm: "w-4 h-4 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-6 h-6 border-[3px]",
};

const colorMap = {
  primary: "border-primary/30 border-t-primary",
  white: "border-white/30 border-t-white",
  gray: "border-slate-300 border-t-slate-500",
  current: "border-current/30 border-t-current",
};

export const Spinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "current",
  className = "",
}) => {
  const currentSize = sizeMap[size] || sizeMap.md;
  const currentColor = colorMap[color] || colorMap.current;

  return (
    <span
      className={`inline-block rounded-full animate-spin ${currentSize} ${currentColor} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </span>
  );
};

export default Spinner;
