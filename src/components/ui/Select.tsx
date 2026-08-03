import { forwardRef } from 'react';
import type { SelectProps, SelectVariant, SelectSize } from '../../types/common';
import { ChevronDown } from 'lucide-react';

const variantClasses: Record<SelectVariant, string> = {
    default: 'bg-white border border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg shadow-sm',
    outline: 'bg-transparent border-2 border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg',
    filled: 'bg-slate-100 border border-slate-200 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg',
};

const sizeClasses: Record<SelectSize, string> = {
    sm: 'py-1.5 pl-3 pr-8 text-xs',
    md: 'py-2 pl-3.5 pr-9 text-sm',
    lg: 'py-2.5 pl-4 pr-10 text-base',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            variant = 'default',
            selectSize = 'md',
            label,
            error,
            helperText,
            options = [],
            placeholder,
            fullWidth = true,
            showLabel = true,
            leftIcon: LeftIcon,
            className = '',
            disabled,
            id,
            ...props
        },
        ref
    ) => {
        const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
        const errorContainerClass = error
            ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-200'
            : '';

        const widthClass = fullWidth ? 'w-full' : 'w-auto';

        return (
            <div className={`flex flex-col gap-1.5 ${widthClass}`}>
                {label && showLabel && (
                    <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div
                    className={`relative flex items-center transition-all duration-200 ${variantClasses[variant]} ${errorContainerClass} ${disabled ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''}`}
                >
                    {LeftIcon && (
                        <div className="pl-3 text-slate-400 shrink-0">
                            <LeftIcon className="w-4 h-4" />
                        </div>
                    )}

                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled}
                        className={`w-full bg-transparent text-slate-900 outline-none appearance-none cursor-pointer ${sizeClasses[selectSize]} ${LeftIcon ? 'pl-2' : ''} ${className}`}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled className="text-slate-400">
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div className="absolute right-3 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>

                {error && <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>}
                {helperText && !error && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
export default Select;
