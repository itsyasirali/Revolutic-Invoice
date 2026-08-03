import { forwardRef } from 'react';
import type { InputProps, InputVariant, InputSize } from '../../types/common';
import { X } from 'lucide-react';

const variantClasses: Record<InputVariant, string> = {
    default: 'bg-white border border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg shadow-sm',
    outline: 'bg-transparent border-2 border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg',
    filled: 'bg-slate-100 border border-slate-200 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg',
    flushed: 'bg-transparent border-b-2 border-slate-300 focus-within:border-primary rounded-none shadow-none px-0',
};

const sizeClasses: Record<InputSize, string> = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2 px-3.5 text-sm',
    lg: 'py-2.5 px-4 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            variant = 'default',
            inputSize = 'md',
            label,
            error,
            helperText,
            leftIcon: LeftIcon,
            rightIcon: RightIcon,
            fullWidth = true,
            prefix,
            suffix,
            showLabel = true,
            clearable = false,
            onClear,
            className = '',
            disabled,
            value,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
        const hasValue = value !== undefined && value !== '' && value !== null;
        const errorContainerClass = error
            ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-200'
            : '';

        const widthClass = fullWidth ? 'w-full' : 'w-auto';

        return (
            <div className={`flex flex-col gap-1.5 ${widthClass}`}>
                {label && showLabel && (
                    <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div
                    className={`relative flex items-center transition-all duration-200 ${variantClasses[variant]} ${errorContainerClass} ${disabled ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''}`}
                >
                    {prefix && (
                        <div className="pl-3 pr-1 text-slate-500 font-medium select-none text-sm shrink-0">
                            {prefix}
                        </div>
                    )}

                    {LeftIcon && (
                        <div className="pl-3 text-slate-400 shrink-0">
                            <LeftIcon className="w-4 h-4" />
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        value={value}
                        disabled={disabled}
                        className={`w-full bg-transparent text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${sizeClasses[inputSize]} ${className}`}
                        {...props}
                    />

                    {clearable && hasValue && !disabled && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="p-1 mr-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {RightIcon && (
                        <div className="pr-3 text-slate-400 shrink-0">
                            <RightIcon className="w-4 h-4" />
                        </div>
                    )}

                    {suffix && (
                        <div className="pr-3 pl-1 text-slate-500 font-medium select-none text-sm shrink-0">
                            {suffix}
                        </div>
                    )}
                </div>

                {error && <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5">{error}</p>}
                {helperText && !error && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
export default Input;
