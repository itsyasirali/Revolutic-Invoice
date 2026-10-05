export type ReportRange =
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "this-year"
  | "last-12-months"
  | "all-time";

export interface ReportRangeOption {
  value: ReportRange;
  label: string;
}

export interface ReportMonthPoint {
  month: string;
  income: number;
  expenses: number;
  invoiced: number;
}

export interface ReportCustomerRow {
  name: string;
  invoices: number;
  invoiced: number;
  received: number;
  outstanding: number;
}

export interface ReportAgingBucket {
  label: string;
  count: number;
  amount: number;
}

export interface ReportOverdueInvoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  dueDate: string;
  daysOverdue: number;
  amount: number;
}

export interface ReportExpenseCategoryRow {
  name: string;
  count: number;
  amount: number;
}

export interface ReportTimeRow {
  name: string;
  hours: number;
  billableHours: number;
  amount: number;
}

export interface ReportsData {
  currency: string;
  range: ReportRange;
  rangeLabel: string;
  summary: {
    invoiced: number;
    received: number;
    expenses: number;
    netProfit: number;
    outstanding: number;
    overdue: number;
    invoiceCount: number;
    paidCount: number;
  };
  months: ReportMonthPoint[];
  customers: ReportCustomerRow[];
  aging: ReportAgingBucket[];
  overdueInvoices: ReportOverdueInvoice[];
  expenseCategories: ReportExpenseCategoryRow[];
  time: {
    totalHours: number;
    billableHours: number;
    unbilledAmount: number;
    byProject: ReportTimeRow[];
  };
}
