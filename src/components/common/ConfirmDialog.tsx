import React from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import type { ConfirmDialogProps } from '../../types/common';


const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'warning',
}) => {
    if (!isOpen) return null;

    const config = {
        danger: {
            icon: AlertTriangle,
            iconColor: 'text-red-600',
            confirmBg: 'bg-red-600 hover:bg-red-700',
            bgColor: 'bg-red-50',
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-yellow-600',
            confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
            bgColor: 'bg-yellow-50',
        },
        info: {
            icon: Info,
            iconColor: 'text-blue-600',
            confirmBg: 'bg-blue-600 hover:bg-blue-700',
            bgColor: 'bg-blue-50',
        },
        success: {
            icon: CheckCircle,
            iconColor: 'text-green-600',
            confirmBg: 'bg-green-600 hover:bg-green-700',
            bgColor: 'bg-green-50',
        },
    };

    const { icon: Icon, iconColor, confirmBg, bgColor } = config[type];

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-opacity-50 z-50 transition-opacity"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full pointer-events-auto transform transition-all">
                    {/* Header */}
                    <div className={`flex items-start gap-4 p-6 ${bgColor} rounded-t-lg`}>
                        <div className={`flex-shrink-0 ${iconColor}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                            <p className="mt-2 text-sm text-gray-600">{message}</p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end px-6 py-4 bg-gray-50 rounded-b-lg">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${confirmBg}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmDialog;
