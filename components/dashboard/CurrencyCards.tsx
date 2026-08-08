"use client";

import React from "react";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";

export type CurrencyStat = {
  currency: string;
  received: number;
  remaining: number;
};

const CurrencyCards = ({
  currencyStats,
}: {
  currencyStats: CurrencyStat[];
}) => {
  if (!currencyStats || currencyStats.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[17px] font-medium text-gray-800">
            Financial Overview
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currencyStats.map((stat) => (
          <div
            key={stat.currency}
            className="bg-white rounded-md border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-gray-900 font-bold text-lg leading-tight">
                    {stat.currency}
                  </h5>
                  <span className="text-xs font-medium text-gray-500">
                    Currency Account
                  </span>
                </div>
              </div>
              <div className="h-8 w-14 bg-gray-50 rounded flex items-center justify-center text-xs font-semibold text-gray-400 border border-gray-100">
                {stat.currency}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-green-50/50 border border-green-100/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Received
                  </span>
                </div>
                <span className="text-[15px] font-bold text-green-700">
                  {stat.received.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-red-50/50 border border-red-100/50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Pending
                  </span>
                </div>
                <span className="text-[15px] font-bold text-red-600">
                  {stat.remaining.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
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
