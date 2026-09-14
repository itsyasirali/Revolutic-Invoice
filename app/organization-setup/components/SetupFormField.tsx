import React from "react";
import type { SetupFormFieldProps } from "@/types/organization";

export const SetupFormField: React.FC<SetupFormFieldProps> = ({
  label,
  required = false,
  children,
  className = "",
  error,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs sm:text-[13px] font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default SetupFormField;
