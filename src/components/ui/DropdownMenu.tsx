import React, { useState, useRef, useEffect } from 'react';
import type { DropdownMenuProps, DropdownMenuItem } from '../../types/common';

const variantItemClasses: Record<NonNullable<DropdownMenuItem['variant']>, string> = {
    default: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    danger: 'text-red-600 hover:bg-red-50 hover:text-red-700',
    success: 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700',
    warning: 'text-amber-600 hover:bg-amber-50 hover:text-amber-700',
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
    items,
    trigger,
    align = 'right',
    width = 'w-56',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleItemClick = (item: DropdownMenuItem) => {
        if (!item.disabled) {
            item.onClick();
            setIsOpen(false);
        }
    };

    const alignmentClass =
        align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            <div
                onClick={() => setIsOpen((prev) => !prev)}
                className="cursor-pointer inline-flex items-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen((prev) => !prev);
                    }
                }}
            >
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`absolute mt-2 ${width} ${alignmentClass} bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-reveal transform origin-top-right ${className}`}
                >
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        const variantClass = variantItemClasses[item.variant || 'default'];

                        return (
                            <React.Fragment key={index}>
                                {item.dividerBefore && <div className="my-1 border-t border-slate-100" />}
                                <button
                                    type="button"
                                    onClick={() => handleItemClick(item)}
                                    disabled={item.disabled}
                                    className={`w-full flex items-start gap-3 px-3.5 py-2.5 text-xs text-left font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${variantClass}`}
                                >
                                    {Icon && <Icon className="w-4 h-4 mt-0.5 shrink-0" />}
                                    <div className="flex flex-col min-w-0">
                                        <span className="truncate">{item.label}</span>
                                        {item.description && (
                                            <span className="text-[11px] font-normal text-slate-400 truncate">
                                                {item.description}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
