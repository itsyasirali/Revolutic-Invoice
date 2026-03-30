import React from 'react';
import type { TabsProps } from '../../types/common';


const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex gap-6 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === tab.value ? 'text-blue-500' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    {tab.label}
                    {tab.count !== undefined && ` (${tab.count})`}
                    {activeTab === tab.value && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
