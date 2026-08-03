import React from 'react';
import type { BadgeProps, BadgeVariant, BadgeSize } from '../../types/common';

const variantClasses: Record<BadgeVariant, { container: string; dot: string }> = {
    primary: {
        container: 'bg-primary/10 text-primary border border-primary/20',
        dot: 'bg-primary',
    },
    secondary: {
        container: 'bg-secondary/10 text-secondary border border-secondary/20',
        dot: 'bg-secondary',
    },
    success: {
        container: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        dot: 'bg-emerald-500',
    },
    danger: {
        container: 'bg-rose-50 text-rose-700 border border-rose-200',
        dot: 'bg-rose-500',
    },
    warning: {
        container: 'bg-amber-50 text-amber-800 border border-amber-200',
        dot: 'bg-amber-500',
    },
    info: {
        container: 'bg-sky-50 text-sky-700 border border-sky-200',
        dot: 'bg-sky-500',
    },
    gray: {
        container: 'bg-slate-100 text-slate-700 border border-slate-200',
        dot: 'bg-slate-500',
    },
    outline: {
        container: 'bg-transparent text-slate-700 border border-slate-300',
        dot: 'bg-slate-400',
    },
    default: {
        container: 'bg-primary/10 text-primary border border-primary/20',
        dot: 'bg-primary',
    },
};

const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-[11px] font-medium gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
};

export const Badge: React.FC<BadgeProps> = ({
    children,
    label,
    status,
    variant = 'primary',
    size = 'md',
    dot = false,
    icon: Icon,
    rounded = true,
    className = '',
}) => {
    let computedVariant = variant;
    if (status && !label && !children) {
        const lower = status.toLowerCase();
        if (lower.includes('active') || lower.includes('paid') || lower.includes('success')) computedVariant = 'success';
        else if (lower.includes('inactive') || lower.includes('archived')) computedVariant = 'gray';
        else if (lower.includes('overdue') || lower.includes('failed')) computedVariant = 'danger';
        else if (lower.includes('pending') || lower.includes('draft') || lower.includes('sent')) computedVariant = 'warning';
        else computedVariant = 'primary';
    }

    const style = variantClasses[computedVariant] || variantClasses.primary;
    const roundedClass = rounded ? 'rounded-full' : 'rounded-md';

    return (
        <span
            className={`inline-flex items-center justify-center font-sans transition-colors ${style.container} ${sizeClasses[size]} ${roundedClass} ${className}`}
        >
            {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />}
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            {children || label || status}
        </span>
    );
};

export default Badge;
