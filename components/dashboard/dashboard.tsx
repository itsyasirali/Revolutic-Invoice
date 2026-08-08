import React from "react";
import { GreetingSection } from "./greeting";
import { TabNavigation } from "./TabNavigation";
import { ReceivablesCard } from "./ReceiveableCard";
import SalesExpensesChart from "./SalesExpenseChart";
import CurrencyCards from "./CurrencyCards";
import { getDashboardData } from "@/lib/services/dashboardService";
import { auth } from "@/auth";

export const DashboardMain = async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { receivables, salesExpensesData, currencyStats } = await getDashboardData(Number(session.user.id));

  return (
    <div className="w-full bg-white pb-10">
      <GreetingSection />
      <TabNavigation />
      <ReceivablesCard receivables={receivables} />
      <SalesExpensesChart initialData={salesExpensesData} />
      <CurrencyCards currencyStats={currencyStats} />
    </div>
  );
};

export default DashboardMain;
