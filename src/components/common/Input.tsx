import { forwardRef } from 'react';
import type { InputProps } from '../../types/common';


const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            leftIcon: LeftIcon,
            rightIcon: RightIcon,
            fullWidth = false,
            prefix,
            showLabel = true,
            className = '',
            ...props
        },
        ref
    ) => {
        const baseInputStyles = 'px-3 py-2 text-sm transition-all bg-transparent text-gray-900 placeholder:text-slate-400 outline-none w-full';
        const errorStyles = error
            ? 'border-red-500 focus:border-red-500'
            : 'border-slate-300 focus:border-primary';

        // Add a class to indicate if we want the default border/rounded style
        const useDefaultStyles = !className.includes('border-');
        const defaultBorderStyles = useDefaultStyles ? 'border rounded' : '';

        const iconPaddingLeft = LeftIcon ? 'pl-10' : prefix ? 'pl-16' : '';
        const iconPaddingRight = RightIcon ? 'pr-10' : '';
        const widthStyle = fullWidth ? 'w-full' : '';

        return (
            <div className={`${widthStyle}`}>
                {label && showLabel && (
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {prefix && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-700 font-medium">
                            {prefix}
                        </div>
                    )}
                    {LeftIcon && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <LeftIcon className="w-4 h-4 text-gray-400" />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`${baseInputStyles} ${defaultBorderStyles} ${errorStyles} ${iconPaddingLeft} ${iconPaddingRight} ${className}`}
                        {...props}
                    />
                    {RightIcon && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <RightIcon className="w-4 h-4 text-gray-400" />
                        </div>
                    )}
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
