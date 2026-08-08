import React from "react";
import { ReceivablesCard } from "./ReceiveableCard";
import SalesExpensesChart from "./SalesExpenseChart";
import CurrencyCards from "./CurrencyCards";
import RecentInvoices from "./RecentInvoices";
import { getDashboardData } from "@/lib/services/dashboardService";
import { auth } from "@/auth";

export const DashboardMain = async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { receivables, salesExpensesData, currencyStats, recentInvoices } = await getDashboardData(
    Number(session.user.id),
  );

  return (
    <div className="w-full bg-gray-50 pb-10 min-h-screen">
      <div className="mb-4">
        <span className="text-blue-500 font-medium cursor-pointer">
          Dashboard
        </span>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-gray-600">Sales</span>
      </div>
      <ReceivablesCard receivables={receivables} />
      <SalesExpensesChart initialData={salesExpensesData} />
      <RecentInvoices invoices={recentInvoices} />
      <CurrencyCards currencyStats={currencyStats} />
    </div>
  );
};

export default DashboardMain;
