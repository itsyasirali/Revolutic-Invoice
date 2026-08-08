"use client";

import React from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import type { ConfirmDialogProps } from '@/types/common';
import Button from './Button';

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
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
            iconColor: 'text-rose-600',
            buttonVariant: 'danger' as const,
            bgColor: 'bg-rose-50/70',
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-amber-600',
            buttonVariant: 'warning' as const,
            bgColor: 'bg-amber-50/70',
        },
        info: {
            icon: Info,
            iconColor: 'text-sky-600',
            buttonVariant: 'primary' as const,
            bgColor: 'bg-sky-50/70',
        },
        success: {
            icon: CheckCircle,
            iconColor: 'text-emerald-600',
            buttonVariant: 'success' as const,
            bgColor: 'bg-emerald-50/70',
        },
    };

    const { icon: Icon, iconColor, buttonVariant, bgColor } = config[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onCancel}
            />

            {/* Dialog Container */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full z-10 overflow-hidden animate-reveal">
                {/* Header */}
                <div className={`flex items-start gap-4 p-6 ${bgColor} border-b border-slate-100`}>
                    <div className={`p-2.5 rounded-xl bg-white shadow-sm shrink-0 ${iconColor}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900">{title}</h3>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{message}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-full transition-colors cursor-pointer shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 justify-end px-6 py-4 bg-slate-50/80 border-t border-slate-100">
                    {cancelText && (
                        <Button onClick={onCancel} variant="outline" size="sm">
                            {cancelText}
                        </Button>
                    )}
                    <Button onClick={onConfirm} variant={buttonVariant} size="sm">
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
