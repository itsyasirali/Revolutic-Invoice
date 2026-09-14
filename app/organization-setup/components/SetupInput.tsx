"use client";

import React, { forwardRef } from "react";

export interface SetupInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const SetupInput = forwardRef<HTMLInputElement, SetupInputProps>(
  ({ className = "", error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-11 px-3.5 rounded-lg border bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            : "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-slate-400"
        } ${className}`}
        {...props}
      />
    );
  }
);

SetupInput.displayName = "SetupInput";

export default SetupInput;
