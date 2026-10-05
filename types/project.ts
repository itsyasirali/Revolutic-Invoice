import type { TimeEntry } from "@/types/timeEntry";
import type { Expense } from "@/types/expense";
import type { Quote } from "@/types/quote";

export const PROJECT_STATUSES = ["Active", "On Hold", "Completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const BILLING_METHODS = ["Hourly", "Fixed"] as const;
export type BillingMethod = (typeof BILLING_METHODS)[number];

export interface ProjectStats {
  loggedMinutes: number;
  billableMinutes: number;
  nonBillableMinutes: number;
  unbilledTimeAmount: number;
  invoicedTimeAmount: number;
  expenseTotal: number;
  unbilledExpenseAmount: number;
  invoicedExpenseAmount: number;
}

export interface ProjectTask {
  id: number;
  projectId: number;
  name: string;
  description?: string | null;
  status: "Open" | "Completed";
  sortOrder: number;
}

export interface Project {
  id: number;
  projectNumber: string;
  name: string;
  description?: string | null;
  customerId: number;
  customer?: { id: number; displayName?: string; companyName?: string; currency?: string } | null;
  quoteId?: number | null;
  status: ProjectStatus;
  billingMethod: BillingMethod;
  hourlyRate: number | string;
  fixedAmount: number | string;
  fixedInvoiceId?: number | null;
  budgetHours: number | string;
  budgetAmount: number | string;
  currency: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  stats?: ProjectStats;
}

export interface ProjectInvoiceRef {
  id: number;
  invoiceNumber: string;
  status?: string;
  total?: number | string;
  currency?: string;
}

/** Extras the project list carries, so the detail page needs no request of its own. */
export type ProjectListDetail = Omit<ProjectDetailData, "project">;

export interface ProjectDetailData {
  project: Project;
  tasks: ProjectTask[];
  timeEntries: TimeEntry[];
  expenses: Expense[];
  quote: Quote | null;
  invoices: ProjectInvoiceRef[];
}

export interface ProjectListProps {
  initialProjects?: Project[];
}
