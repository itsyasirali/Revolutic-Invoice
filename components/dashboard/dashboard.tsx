import React from "react";
import DashboardHeader from "./DashboardHeader";
import MetricCards from "./MetricCards";
import RevenueOverviewChart from "./RevenueOverviewChart";
import SalesOverviewDonut from "./SalesOverviewDonut";
import RecentInvoicesTable from "./RecentInvoicesTable";
import MonthlySummaryCard from "./MonthlySummaryCard";
import getDashboardData from "@/lib/services/dashboardService";
import { getServerSessionUser } from "@/lib/session";

export const DashboardMain = async () => {
  const user = await getServerSessionUser();
  const userId = user?.id ? Number(user.id) : 1;
  const userName =
    user?.name ||
    (user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : null) ||
    "Ahmad Shahzad";

  const dashboardData = await getDashboardData(userId);

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 space-y-6 pb-12 animate-fade-in">
      {/* Top Greeting */}
      <DashboardHeader userName={userName} />

      {/* 4 Top KPI Metric Cards */}
      <MetricCards kpis={dashboardData.kpis} />

      {/* Middle Row: Revenue Area Chart (66%), Sales Donut (34%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 min-h-85">
          <RevenueOverviewChart data={dashboardData.revenueOverview} />
        </div>
        <div className="lg:col-span-4 min-h-85">
          <SalesOverviewDonut data={dashboardData.salesOverview} />
        </div>
      </div>

      {/* Bottom Row: Recent Invoices Table (66%), Monthly Summary (34%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 min-h-80">
          <RecentInvoicesTable invoices={dashboardData.recentInvoices} />
        </div>
        <div className="lg:col-span-4 min-h-80">
          <MonthlySummaryCard metrics={dashboardData.monthlySummary} />
        </div>
      </div>
    </div>
  );
};

export default DashboardMain;
