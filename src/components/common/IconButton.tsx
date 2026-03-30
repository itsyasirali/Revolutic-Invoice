import React from 'react';
import type { IconButtonProps } from '../../types/common';


const IconButton: React.FC<IconButtonProps> = ({
    icon: Icon,
    variant = 'ghost',
    size = 'md',
    rounded = false,
    label,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizeStyles = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const roundedStyle = rounded ? 'rounded-full' : 'rounded-md';

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
