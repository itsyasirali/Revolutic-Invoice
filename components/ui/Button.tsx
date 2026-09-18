"use client";

import React, { forwardRef } from "react";
import type { ButtonProps, ButtonVariant, ButtonSize } from "@/types/common";
import { Spinner } from "./Spinner";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary/90 focus:ring-primary/40 shadow-sm border border-transparent",
  secondary:
    "bg-primary text-white hover:bg-primary/90 focus:ring-secondary/40 shadow-sm border border-transparent",
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
  link: "bg-transparent text-primary hover:underline hover:text-primary/80 border-none p-0 shadow-none focus:ring-0 focus:outline-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs gap-1.5 font-medium",
  sm: "px-3 py-2 text-xs gap-1.5 font-medium",
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
      iconPosition = "right",
      rounded = false,
      asChild = false,
      children,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isLink = variant === "link";
    const baseClasses = isLink
      ? "inline-flex items-center justify-center font-sans tracking-wide transition-colors focus:outline-none cursor-pointer"
      : "inline-flex items-center justify-center font-sans tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] cursor-pointer";
    const borderRadiusClass = isLink ? "" : (rounded ? "rounded-md" : "rounded-sm");
    const widthClass = fullWidth ? "w-full" : "";
    const sizeStyle = isLink ? "" : sizeClasses[size];
    const combinedClasses =
      `${baseClasses} ${variantClasses[variant]} ${sizeStyle} ${borderRadiusClass} ${widthClass} ${className}`.trim();

    if (
      asChild &&
      children &&
      typeof children === "object" &&
      "props" in children
    ) {
      const child = children as React.ReactElement<{ className?: string }>;
      return (
        <span className="inline-flex">
          {React.cloneElement(child, {
            className:
              `${combinedClasses} ${child.props.className || ""}`.trim(),
          })}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={combinedClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner
            size={size === "xs" || size === "sm" ? "xs" : "sm"}
            color="current"
            className="shrink-0"
          />
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
