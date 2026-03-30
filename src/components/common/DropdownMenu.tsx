import React, { useState, useRef, useEffect } from 'react';
import type { DropdownMenuItem, DropdownMenuProps } from '../../types/common';


const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, trigger, align = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleItemClick = (item: DropdownMenuItem) => {
        if (!item.disabled) {
            item.onClick();
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div
                        className={`absolute mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 ${align === 'right' ? 'right-0' : 'left-0'
                            }`}
                    >
                        {items.map((item, index) => {
                            const Icon = item.icon;
                            const variantClass =
                                item.variant === 'danger'
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-gray-700 hover:bg-gray-50';

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleItemClick(item)}
                                    disabled={item.disabled}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${index === 0 ? 'rounded-t-md' : ''
                                        } ${index === items.length - 1 ? 'rounded-b-md' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default DropdownMenu;
