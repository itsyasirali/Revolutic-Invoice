import React, { useState } from 'react';
import {
    X,
    Search,
    Globe,
    Palette,
    BarChart3,
    Users,
    Shield,
    Receipt,
    FileStack,
    Package,
    User as UserIcon,
    FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    if (!isOpen) return null;

    const settingsMenuItems = [
        { icon: Globe, label: 'Organization Profile', onClick: () => console.log('Organization Profile') },
        { icon: Palette, label: 'Branding', onClick: () => console.log('Branding') },
        { icon: BarChart3, label: 'Usage Stats', onClick: () => console.log('Usage Stats') },
        { icon: Users, label: 'Users', onClick: () => console.log('Users') },
        { icon: Shield, label: 'Roles', onClick: () => console.log('Roles') },
        { icon: Receipt, label: 'Taxes', onClick: () => console.log('Taxes') },
        { icon: Globe, label: 'Customer Portal', onClick: () => console.log('Customer Portal') },
        { divider: true },
        { icon: FileStack, label: 'General Preferences', onClick: () => console.log('General Preferences') },
        { icon: Package, label: 'Items', onClick: () => console.log('Items') },
        { icon: UserIcon, label: 'Customers', onClick: () => console.log('Customers') },
        { icon: FileText, label: 'Quotes', onClick: () => console.log('Quotes') },
        { icon: Receipt, label: 'Invoices', onClick: () => console.log('Invoices') },
        { icon: FileText, label: 'PDF Templates', onClick: () => { onClose(); navigate('/templates'); } },
    ];

    const filteredItems = settingsMenuItems.filter(item => {
        if ('divider' in item) return true;
        return item.label.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out sm:max-w-sm">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Settings"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-2">
                    {filteredItems.map((item, index) => {
                        if ('divider' in item && item.divider) {
                            // Only show divider if it's not the first or last visible item (simple heuristic)
                            return <div key={`divider-${index}`} className="h-px bg-gray-100 my-2 mx-4" />;
                        }
                        if ('icon' in item && item.icon) {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={item.onClick}
                                    className="w-full text-left px-6 py-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3 group"
                                >
                                    <Icon size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
};
