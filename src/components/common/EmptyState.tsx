import React from 'react';
import type { EmptyStateProps } from '../../types/common';


const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, action }) => {
    return (
        <div className="p-12 text-center border border-gray-200 rounded-md">
            <div className="p-5 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Icon className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
