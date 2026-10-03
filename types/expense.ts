export type ExpenseStatus = "Non-Billable" | "Unbilled" | "Invoiced";

export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  expenseNumber: string;
  expenseDate: string;
  vendor?: string | null;
  customerId?: number | null;
  projectId?: number | null;
  projectRef?: { id: number; name: string; projectNumber: string } | null;
  customer?: {
    id: number;
    displayName?: string;
    companyName?: string;
  } | null;
  categoryId?: number | null;
  category?: ExpenseCategory | null;
  description?: string | null;
  amount: number | string;
  currency: string;
  taxPercent: number;
  tax: number | string;
  total: number | string;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  billable: boolean;
  invoiced: boolean;
  invoiceId?: number | null;
  invoice?: { id: number; invoiceNumber: string } | null;
  notes?: string | null;
  attachment?: string | null;
  status: ExpenseStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseListProps {
  initialExpenses?: Expense[];
}

export const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Credit Card",
  "Debit Card",
  "Other",
] as const;
