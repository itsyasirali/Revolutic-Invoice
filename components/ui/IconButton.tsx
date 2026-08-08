"use client";

import React from 'react';
import type { IconButtonProps } from '@/types/common';

export const IconButton: React.FC<IconButtonProps> = ({
    icon: Icon,
    variant = 'ghost',
    size = 'md',
    rounded = false,
    label,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95';

    const variantStyles = {
        primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/40 shadow-sm',
        secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400 shadow-sm',
        danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger/40 shadow-sm',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
    };

    const sizeStyles = {
        sm: 'p-1.5 text-xs',
        md: 'p-2 text-sm',
        lg: 'p-2.5 text-base',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const roundedStyle = rounded ? 'rounded-full' : 'rounded-lg';

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${roundedStyle} ${className}`}
            aria-label={label || 'Icon button'}
            {...props}
        >
            <Icon className={iconSizes[size]} />
        </button>
    );
};

export default IconButton;
