import React from "react";
import type { BadgeProps, BadgeVariant, BadgeSize } from "@/types/common";

const variantClasses: Record<BadgeVariant, { container: string; dot: string }> =
  {
    primary: {
      container: "bg-blue-50 text-blue-700 border border-blue-200",
      dot: "bg-blue-500",
    },
    secondary: {
      container: "bg-blue-50 text-blue-700 border border-blue-200",
      dot: "bg-blue-500",
    },
    success: {
      container: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
    },
    active: {
      container: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
    },
    danger: {
      container: "bg-rose-50 text-rose-700 border border-rose-200",
      dot: "bg-rose-500",
    },
    warning: {
      container: "bg-amber-50 text-amber-800 border border-amber-200",
      dot: "bg-amber-500",
    },
    info: {
      container: "bg-sky-50 text-sky-700 border border-sky-200",
      dot: "bg-sky-500",
    },
    gray: {
      container: "bg-slate-100 text-slate-700 border border-slate-200",
      dot: "bg-slate-500",
    },
    inactive: {
      container: "bg-slate-100 text-slate-600 border border-slate-200",
      dot: "bg-slate-400",
    },
    outline: {
      container: "bg-transparent text-slate-700 border border-slate-300",
      dot: "bg-slate-400",
    },
    default: {
      container: "bg-slate-100 text-slate-700 border border-slate-200",
      dot: "bg-slate-500",
    },
  };

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] font-medium gap-1",
  md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
  lg: "px-3 py-1.5 text-sm font-semibold gap-2",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  label,
  status,
  variant,
  size = "md",
  dot = false,
  icon: Icon,
  rounded = true,
  className = "",
}) => {
  const text = (status || label || (typeof children === "string" ? children : "")).toString().trim();
  const lower = text.toLowerCase();

  let computedVariant: BadgeVariant = variant || "primary";

  // Auto-detect status colors when variant is not explicitly specialized
  if (!variant || variant === "primary" || variant === "default") {
    if (lower === "inactive" || lower.startsWith("inactive") || lower.includes("inactive") || lower.includes("archived")) {
      computedVariant = "inactive";
    } else if (lower === "active" || lower.includes("active")) {
      computedVariant = "active";
    } else if (lower.includes("partially paid") || lower.includes("partial") || lower === "partially_paid") {
      computedVariant = "warning";
    } else if (lower === "paid" || lower.includes("paid") || lower.includes("success")) {
      computedVariant = "success";
    } else if (lower.includes("overdue") || lower.includes("failed") || lower.includes("unpaid")) {
      computedVariant = "danger";
    } else if (lower.includes("sent")) {
      computedVariant = "info";
    } else if (lower.includes("draft") || lower.includes("pending") || lower.includes("cancelled")) {
      computedVariant = "gray";
    }
  }

  const style = variantClasses[computedVariant] || variantClasses.primary;
  const roundedClass = rounded ? "rounded-md" : "rounded-md";

  return (
    <span
      className={`inline-flex items-center justify-center font-sans transition-colors ${style.container} ${sizeClasses[size]} ${roundedClass} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-md shrink-0 ${style.dot}`} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children || label || status}
    </span>
  );
};

export default Badge;
