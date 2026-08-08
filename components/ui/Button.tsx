"use client";

import { forwardRef } from "react";
import type { ButtonProps, ButtonVariant, ButtonSize } from "@/types/common";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary/90 focus:ring-primary/40 shadow-sm border border-transparent",
  secondary:
    "bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/40 shadow-sm border border-transparent",
  outline:
    "bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-300 focus:ring-slate-400",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100/80 focus:ring-slate-300 border border-transparent shadow-none",
  danger:
    "bg-danger text-white hover:bg-danger/90 focus:ring-danger/40 shadow-sm border border-transparent",
  success:
    "bg-success text-white hover:bg-success/90 focus:ring-success/40 shadow-sm border border-transparent",
  warning:
    "bg-warning text-white hover:bg-warning/90 focus:ring-warning/40 shadow-sm border border-transparent",
  link: "bg-transparent text-primary hover:underline hover:text-primary/80 focus:ring-primary/30 border border-transparent p-0 shadow-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs gap-1.5 font-medium",
  sm: "px-3 py-1.5 text-xs gap-1.5 font-medium",
  md: "px-4 py-2 text-sm gap-2 font-medium",
  lg: "px-5 py-2.5 text-base gap-2 font-semibold",
  xl: "px-6 py-3.5 text-lg gap-2.5 font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = "left",
      rounded = false,
      children,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-sans tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] cursor-pointer";
    const borderRadiusClass = rounded ? "rounded-md" : "rounded-sm";
    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${borderRadiusClass} ${widthClass} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-md animate-spin shrink-0" />
        ) : (
          icon &&
          iconPosition === "left" && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
