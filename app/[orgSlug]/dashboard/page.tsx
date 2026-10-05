import React from "react";
import { DashboardMain } from "@/components/dashboard/dashboard";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Dashboard", "See your revenue, outstanding invoices, payments, expenses and monthly business insights at a glance.");


const DashboardPage = () => {
  return <DashboardMain />;
};

export default DashboardPage;
