import { forwardRef } from 'react';
import type { TextareaProps } from '../../types/common';


const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            error,
            helperText,
            fullWidth = false,
            resize = 'none',
            className = '',
            ...props
        },
        ref
    ) => {
        const baseStyles = 'px-3 py-2 text-sm border rounded focus:outline-none transition-colors bg-transparent text-gray-700';
        const errorStyles = error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:border-gray-400';
        const resizeStyle = {
            none: 'resize-none',
            vertical: 'resize-y',
            horizontal: 'resize-x',
            both: 'resize',
        }[resize];
        const widthStyle = fullWidth ? 'w-full' : '';

        return (
            <div className={`${widthStyle}`}>
                {label && (
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`${baseStyles} ${errorStyles} ${resizeStyle} ${widthStyle} ${className}`}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
