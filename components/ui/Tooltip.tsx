"use client";

import React, { useState, useId } from "react";

interface TooltipProps {
  /** Short help text shown on hover/focus. */
  content: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Minimal, dependency-free, accessible tooltip. Wraps its child (typically
 * an icon) and shows a small text bubble on hover or keyboard focus.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span
        tabIndex={0}
        aria-describedby={tooltipId}
        className="inline-flex items-center cursor-help outline-none"
      >
        {children}
      </span>
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-64 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-xs font-medium shadow-lg pointer-events-none whitespace-normal"
        >
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  );
};

export default Tooltip;
