import React from 'react';
import type { StatusBadgeProps } from '../../types/common';


const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant }) => {
    const getStatusColor = () => {
        if (variant) {
            const colors = {
                active: 'bg-green-100 text-green-700',
                inactive: 'bg-gray-200 text-gray-600',
                success: 'bg-green-100 text-green-700',
                danger: 'bg-red-100 text-red-700',
                warning: 'bg-yellow-100 text-yellow-700',
                info: 'bg-blue-100 text-blue-700',
                default: 'bg-blue-100 text-blue-700',
            };
            return colors[variant] || colors.default;
        }

        // Auto-detect from status text
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('active')) return 'bg-green-100 text-green-700';
        if (statusLower.includes('inactive')) return 'bg-gray-200 text-gray-600';
        if (statusLower.includes('paid') || statusLower.includes('success')) return 'bg-green-100 text-green-700';
        if (statusLower.includes('overdue') || statusLower.includes('failed')) return 'bg-red-100 text-red-700';
        if (statusLower.includes('pending') || statusLower.includes('draft')) return 'bg-yellow-100 text-yellow-700';

        return 'bg-blue-100 text-blue-700';
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor()}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
