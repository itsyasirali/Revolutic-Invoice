import { forwardRef } from 'react';
import type { ButtonProps } from '../../types/common';


const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            fullWidth = false,
            icon,
            iconPosition = 'left',
            children,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm';

        const variantStyles = {
            primary: 'bg-primary text-white hover:bg-primary cursor-pointer outline-none focus:ring-primary',
            secondary: 'bg-secondary text-white border border-secondary outline-none cursor-pointer hover:opacity-90',
            danger: 'bg-danger text-white hover:bg-danger cursor-pointer outline-none focus:ring-danger',
            success: 'bg-success text-white hover:bg-success cursor-pointer outline-none focus:ring-success',
            warning: 'bg-warning text-white hover:bg-warning cursor-pointer outline-none focus:ring-warning',
            ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200 outline-none cursor-pointer',
            link: 'bg-transparent text-primary hover:text-primary/80 outline-none hover:underline cursor-pointer',
        };

        const sizeStyles = {
            sm: 'px-4 py-2 text-xs',
            md: 'px-5 py-2.5 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        const widthStyle = fullWidth ? 'w-full' : '';

        const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

        return (
            <button
                ref={ref}
                className={combinedClassName}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {!loading && icon && iconPosition === 'left' && icon}
                {children}
                {!loading && icon && iconPosition === 'right' && icon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
