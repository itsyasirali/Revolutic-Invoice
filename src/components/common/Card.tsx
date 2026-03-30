import React from 'react';
import type { CardProps } from '../../types/common';


const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    bordered = true,
    shadow = 'sm',
    hoverable = false,
    onClick,
}) => {
    const paddingStyles = {
        none: '',
        sm: 'p-3',
        md: 'p-6',
        lg: 'p-8',
    };

    const shadowStyles = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
    };

    const borderStyle = bordered ? 'border border-gray-200' : '';
    const hoverStyle = hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : '';
    const clickable = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`bg-white rounded-md ${paddingStyles[padding]} ${borderStyle} ${shadowStyles[shadow]} ${hoverStyle} ${clickable} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
