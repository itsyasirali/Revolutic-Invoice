import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ChevronDown } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    subtitle?: React.ReactNode;
    showBackButton?: boolean;
    onBack?: () => void;
    actions?: React.ReactNode;
    className?: string;
    dropdown?: {
        options: { label: string; value: string }[];
        value: string;
        onChange: (value: string) => void;
        isOpen: boolean;
        onToggle: () => void;
    };
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    showBackButton = false,
    onBack,
    actions,
    className = '',
    dropdown,
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={`bg-gray-50 border-b border-gray-100 ${className}`}>
            <div className="px-8 py-5 mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {showBackButton && (
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div>
                            {dropdown ? (
                                <div className="relative">
                                    <button
                                        onClick={dropdown.onToggle}
                                        className="flex items-center gap-2 py-1 group"
                                    >
                                        <h1 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">
                                            {dropdown.options.find(opt => opt.value === dropdown.value)?.label || title}
                                        </h1>
                                        <ChevronDown
                                            strokeWidth={3}
                                            className={`w-6 h-6 mt-1 text-primary transition-transform duration-200 ${dropdown.isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {dropdown.isOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={dropdown.onToggle}
                                            />
                                            <div className="absolute mt-2 left-0 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                {dropdown.options.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => {
                                                            dropdown.onChange(option.value);
                                                            dropdown.onToggle();
                                                        }}
                                                        className={`block w-full text-left px-5 py-3 text-sm transition-colors ${dropdown.value === option.value
                                                            ? 'bg-primary/5 text-primary font-semibold'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
                            )}
                            {subtitle && (
                                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 font-medium">
                                    {subtitle}
                                </div>
                            )}
                        </div>
                    </div>
                    {actions && (
                        <div className="flex items-center gap-3">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
