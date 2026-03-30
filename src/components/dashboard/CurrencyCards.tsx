import React from 'react';
import useInvoicesList from '../../hooks/invoices/useInvoicesData';

const CurrencyCards: React.FC = () => {
    const { currencyStats, loading } = useInvoicesList();

    if (loading) {
        return (
            <div className="flex gap-4 mt-8 overflow-x-auto pb-2">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-md shadow-sm p-4 w-48 h-20 animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (!currencyStats || currencyStats.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 w-[97%] mx-auto">
            <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Financial Overview</h4>
            <div className="flex flex-wrap gap-4 w-1/3">
                {currencyStats.map((stat) => (
                    <div key={stat.currency} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow min-w-[250px] flex-1">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                            <h5 className="text-gray-900 font-bold text-lg">{stat.currency}</h5>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Currency</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Received</span>
                                <span className="text-sm font-semibold text-green-600">
                                    {stat.received.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Pending</span>
                                <span className="text-sm font-semibold text-red-600">
                                    {stat.remaining.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CurrencyCards;
