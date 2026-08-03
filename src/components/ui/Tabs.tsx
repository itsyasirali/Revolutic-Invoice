import type { TabsProps } from '../../types/common';

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex gap-6 border-b border-slate-200 -mb-px overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onTabChange(tab.value)}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${activeTab === tab.value ? 'text-primary font-semibold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${activeTab === tab.value ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {tab.count}
                        </span>
                    )}
                    {activeTab === tab.value && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
