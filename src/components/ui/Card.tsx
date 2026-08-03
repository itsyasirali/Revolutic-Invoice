import React from 'react';
import type { CardProps, CardVariant } from '../../types/common';

const variantClasses: Record<CardVariant, string> = {
    default: 'bg-white border border-slate-200/80 shadow-sm rounded-xl',
    flat: 'bg-slate-50 border border-slate-200/60 rounded-xl',
    outlined: 'bg-transparent border border-slate-300 rounded-xl',
    elevated: 'bg-white border border-slate-100 shadow-lg rounded-2xl',
    glass: 'bg-white/80 backdrop-blur-md border border-white/20 shadow-md rounded-2xl',
};

const paddingClasses = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
};

export const Card: React.FC<CardProps> & {
    Header: React.FC<{ children: React.ReactNode; className?: string }>;
    Body: React.FC<{ children: React.ReactNode; className?: string }>;
    Footer: React.FC<{ children: React.ReactNode; className?: string }>;
} = ({
    children,
    className = '',
    variant = 'default',
    padding = 'md',
    bordered,
    hoverable = false,
    onClick,
}) => {
    const hoverClass = hoverable
        ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
        : '';
    const borderOverride = bordered === false ? 'border-none' : bordered === true ? 'border border-slate-300' : '';

    return (
        <div
            onClick={onClick}
            className={`${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${borderOverride} ${className}`}
        >
            {children}
        </div>
    );
};

Card.Header = ({ children, className = '' }) => (
    <div className={`flex items-center justify-between pb-4 border-b border-slate-100 ${className}`}>
        {children}
    </div>
);

Card.Body = ({ children, className = '' }) => (
    <div className={`py-4 ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
    <div className={`flex items-center justify-between pt-4 border-t border-slate-100 ${className}`}>
        {children}
    </div>
);

export default Card;
