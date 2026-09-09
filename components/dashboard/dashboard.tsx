import React from "react";
import { ReceivablesCard } from "./ReceiveableCard";
import SalesExpensesChart from "./SalesExpenseChart";
import CurrencyCards from "./CurrencyCards";
import RecentInvoices from "./RecentInvoices";
import { getDashboardData } from "@/lib/services/dashboardService";
import { getServerSessionUser } from "@/lib/session";

export const DashboardMain = async () => {
  const user = await getServerSessionUser();
  if (!user?.id) return null;

  const { receivables, salesExpensesData, currencyStats, recentInvoices } =
    await getDashboardData(Number(user.id));

  return (
    <div className="w-full pb-10 min-h-screen">
      <div className="mb-4">
        <span className="text-primary font-medium cursor-pointer">
          Dashboard
        </span>
      </div>
      <ReceivablesCard receivables={receivables} />
      <SalesExpensesChart initialData={salesExpensesData} />
      <RecentInvoices invoices={recentInvoices} />
      <CurrencyCards currencyStats={currencyStats} />
    </div>
  );
};

export default DashboardMain;
