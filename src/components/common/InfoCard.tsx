import React from 'react';
import type { InfoCardProps } from '../../types/common';


const InfoCard: React.FC<InfoCardProps> = ({
    icon: Icon,
    label,
    value,
    variant = 'default',
    className = '',
}) => {
    const variants = {
        default: {
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        primary: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-100',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-100',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
        },
    };

    const styles = variants[variant];

    return (
        <div className={`p-4 ${styles.bg} rounded-md border ${styles.border} ${className}`}>
            <div className="flex items-start gap-3">
                <div className={`p-2 ${styles.iconBg} rounded-md`}>
                    <Icon className={`w-4 h-4 ${styles.iconColor}`} />
                </div>
                <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">
                        {label}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{value}</div>
                </div>
            </div>
        </div>
    );
};

export default InfoCard;
