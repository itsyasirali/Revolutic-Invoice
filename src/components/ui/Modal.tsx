import React, { useEffect } from 'react';
import type { ModalProps } from '../../types/common';
import { X } from 'lucide-react';

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] min-h-[90vh]',
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    size = 'md',
    closeOnOutsideClick = true,
    showCloseButton = true,
    className = '',
}) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={closeOnOutsideClick ? onClose : undefined}
            />

            {/* Dialog Container */}
            <div
                className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl border border-slate-100 z-10 overflow-hidden flex flex-col animate-reveal ${className}`}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                        <div>
                            {title && (
                                typeof title === 'string' ? (
                                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                                ) : (
                                    title
                                )
                            )}
                            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                        </div>

                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content Body */}
                <div className="px-6 py-6 overflow-y-auto flex-1">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
