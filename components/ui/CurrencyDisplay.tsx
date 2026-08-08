import React from 'react';
import type { CurrencyDisplayProps } from '@/types/common';

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
    amount,
    currency = 'PKR',
    className = '',
    size = 'md',
}) => {
    const formatCurrency = (value: number | string): string => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '0.00';

        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const sizeClasses = {
        sm: 'text-xs font-medium',
        md: 'text-sm font-semibold',
        lg: 'text-xl font-bold',
    };

    return (
        <span className={`${sizeClasses[size]} tracking-tight font-sans ${className}`}>
            {formatCurrency(amount)} <span className="text-xs font-normal text-slate-400 ml-0.5">{currency}</span>
        </span>
    );
};

export default CurrencyDisplay;
