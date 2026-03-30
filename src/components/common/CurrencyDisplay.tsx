import React from 'react';
import type { CurrencyDisplayProps } from '../../types/common';


const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
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
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-2xl font-bold',
    };

    return (
        <span className={`${sizeClasses[size]} ${className}`}>
            {formatCurrency(amount)} {currency}
        </span>
    );
};

export default CurrencyDisplay;
