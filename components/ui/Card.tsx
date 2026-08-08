"use client";

import React from "react";
import type { CardProps, CardVariant } from "@/types/common";

const variantClasses: Record<CardVariant, string> = {
  default: "bg-white border border-slate-200/80 shadow-sm rounded-md",
  flat: "bg-slate-50 border border-slate-200/60 rounded-md",
  outlined: "bg-transparent border border-slate-300 rounded-md",
  elevated: "bg-white border border-slate-100 shadow-lg rounded-md",
  glass:
    "bg-white/80 backdrop-blur-md border border-white/20 shadow-md rounded-md",
};

const paddingClasses = {
  none: "p-0",
  xs: "p-2",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

export const Card: React.FC<CardProps> & {
  Header: React.FC<{ children: React.ReactNode; className?: string }>;
  Body: React.FC<{ children: React.ReactNode; className?: string }>;
  Footer: React.FC<{ children: React.ReactNode; className?: string }>;
} = ({
  children,
  className = "",
  variant = "default",
  padding = "md",
  bordered,
  hoverable = false,
  onClick,
}) => {
  const hoverClass = hoverable
    ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
    : "";
  const borderOverride =
    bordered === false
      ? "border-none"
      : bordered === true
        ? "border border-slate-300"
        : "";

  return (
    <div
      onClick={onClick}
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${borderOverride} ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`flex items-center justify-between pb-4 border-b border-slate-100 ${className}`}
  >
    {children}
  </div>
);
CardHeader.displayName = "Card.Header";

const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`py-4 ${className}`}>{children}</div>;
CardBody.displayName = "Card.Body";

const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`flex items-center justify-between pt-4 border-t border-slate-100 ${className}`}
  >
    {children}
  </div>
);
CardFooter.displayName = "Card.Footer";

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
