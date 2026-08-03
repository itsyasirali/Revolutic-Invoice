import { forwardRef } from 'react';
import type { CheckboxProps } from '../../types/common';
import { Check } from 'lucide-react';

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            label,
            description,
            error,
            checkboxSize = 'md',
            disabled,
            checked,
            id,
            onChange,
            ...props
        },
        ref
    ) => {
        const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className="flex flex-col gap-1">
                <label
                    htmlFor={checkboxId}
                    className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                        <input
                            ref={ref}
                            type="checkbox"
                            id={checkboxId}
                            checked={checked}
                            disabled={disabled}
                            onChange={onChange}
                            className="sr-only peer"
                            {...props}
                        />
                        <div
                            className={`${sizeClasses[checkboxSize]} rounded border transition-all duration-200 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 ${checked
                                    ? 'bg-primary border-primary text-white'
                                    : 'bg-white border-slate-300 peer-hover:border-slate-400'
                                } ${error ? 'border-red-500' : ''}`}
                        >
                            {checked && <Check className={`${iconSizes[checkboxSize]} stroke-[3]`} />}
                        </div>
                    </div>

                    {(label || description) && (
                        <div className="flex flex-col text-left">
                            {label && <span className="text-sm font-medium text-slate-800">{label}</span>}
                            {description && <span className="text-xs text-slate-500">{description}</span>}
                        </div>
                    )}
                </label>

                {error && <p className="text-xs text-red-500 font-medium ml-7">{error}</p>}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
