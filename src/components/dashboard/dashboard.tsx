import React from "react";
import { GreetingSection } from "./greeting";
import { TabNavigation } from "./TabNavigation";
import { ReceivablesCard } from "./ReceiveableCard";
import SalesExpensesChart from "./SalesExpenseChart";
import CurrencyCards from "./CurrencyCards";

interface DashboardMainProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DashboardMain: React.FC<DashboardMainProps> = () => {

  return (
    <div className="w-full bg-white pb-10">
      <GreetingSection />
      <TabNavigation />
      <ReceivablesCard />
      <SalesExpensesChart />
      <CurrencyCards />
    </div>
  );
};
