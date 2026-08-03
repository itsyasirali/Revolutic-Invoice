import { forwardRef } from 'react';
import type { TextareaProps } from '../../types/common';

const variantClasses = {
    default: 'bg-white border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm',
    outline: 'bg-transparent border-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg',
    filled: 'bg-slate-100 border border-slate-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg',
};

const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            variant = 'default',
            label,
            error,
            helperText,
            fullWidth = true,
            resize = 'vertical',
            showCount = false,
            className = '',
            disabled,
            value,
            maxLength,
            id,
            rows = 4,
            ...props
        },
        ref
    ) => {
        const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
        const errorContainerClass = error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '';
        const widthClass = fullWidth ? 'w-full' : 'w-auto';
        const currentLength = typeof value === 'string' ? value.length : 0;

        return (
            <div className={`flex flex-col gap-1.5 ${widthClass}`}>
                {label && (
                    <div className="flex items-center justify-between">
                        <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            {label}
                            {props.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {showCount && maxLength && (
                            <span className="text-xs text-slate-400">
                                {currentLength}/{maxLength}
                            </span>
                        )}
                    </div>
                )}

                <textarea
                    ref={ref}
                    id={textareaId}
                    rows={rows}
                    value={value}
                    maxLength={maxLength}
                    disabled={disabled}
                    className={`w-full p-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${variantClasses[variant]} ${resizeClasses[resize]} ${errorContainerClass} ${disabled ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''} ${className}`}
                    {...props}
                />

                {error && <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>}
                {helperText && !error && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
export default Textarea;
