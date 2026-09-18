export interface DashboardKPIItem {
  label: string;
  amount: number;
  currency: string;
  changePercent: number;
  isIncrease: boolean;
  periodLabel: string;
}

export interface DashboardKPIs {
  totalInvoices: DashboardKPIItem;
  totalPayments: DashboardKPIItem;
  pendingInvoices: DashboardKPIItem;
  totalExpenses: DashboardKPIItem;
}

export interface RevenuePoint {
  month: string;
  income: number;
  expenses: number;
}

export interface SalesStatusSegment {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface SalesOverviewData {
  totalSales: number;
  currency: string;
  segments: {
    paid: SalesStatusSegment;
    partial: SalesStatusSegment;
    unpaid: SalesStatusSegment;
  };
}

export interface MonthlySummaryMetric {
  label: string;
  value: string;
  changePercent: number;
  isPositive: boolean;
  type: "income" | "expenses" | "netProfit" | "invoicesPaid";
}

export interface DashboardInvoice {
  id: number | string;
  indexNumber: number;
  invoiceNumber: string;
  customerName: string;
  date: string;
  status:
    | "Paid"
    | "Sent"
    | "Partially Paid"
    | "Partial"
    | "Unpaid"
    | "Overdue"
    | "Draft"
    | "Cancelled"
    | string;
  amount: number;
  currency: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  revenueOverview: RevenuePoint[];
  salesOverview: SalesOverviewData;
  recentInvoices: DashboardInvoice[];
  monthlySummary: MonthlySummaryMetric[];
  currencyStats?: { currency: string; received: number; remaining: number }[];
}

export interface SalesOverviewDonutProps {
  data: SalesOverviewData;
}

export interface RevenueOverviewChartProps {
  data: RevenuePoint[];
  currency?: string;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  currency?: string;
}

export interface RecentInvoicesTableProps {
  invoices: DashboardInvoice[];
}

export interface MonthlySummaryCardProps {
  metrics: MonthlySummaryMetric[];
}

export interface DashboardHeaderProps {
  userName?: string;
}

export interface MetricCardsProps {
  kpis: DashboardKPIs;
}
