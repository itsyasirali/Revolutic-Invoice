import { forwardRef } from 'react';
import type { SelectProps } from '../../types/common';


const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            error,
            helperText,
            options,
            placeholder,
            fullWidth = false,
            showLabel = true,
            className = '',
            ...props
        },
        ref
    ) => {
        const baseStyles = 'px-3 py-2 text-sm border rounded focus:outline-none transition-colors bg-transparent text-gray-700';
        const errorStyles = error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:border-gray-400';
        const widthStyle = fullWidth ? 'w-full' : '';

        return (
            <div className={`${widthStyle}`}>
                {label && showLabel && (
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`${baseStyles} ${errorStyles} ${widthStyle} ${className}`}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value} disabled={option.disabled}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
