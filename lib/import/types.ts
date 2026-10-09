// Draft records: the CSV rows mapped to plain, editable objects. They are shown
// (and edited) in the import preview, then sent back and saved as-is.

export type ImportKind = "contacts" | "items" | "projects" | "expenses" | "quotes" | "invoices" | "payments";
export type EntityKey = "customers" | "items" | "projects" | "expenses" | "quotes" | "invoices" | "payments";

export const KIND_ENTITY: Record<ImportKind, EntityKey> = {
  contacts: "customers",
  items: "items",
  projects: "projects",
  expenses: "expenses",
  quotes: "quotes",
  invoices: "invoices",
  payments: "payments",
};

export interface CustomerDraft {
  displayName: string;
  companyName: string;
  customerType: string;
  currency: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  remarks: string;
  createdTime: string;
}

export interface ItemDraft {
  name: string;
  type: string;
  unit: string;
  sellingPrice: number;
  description: string;
  status: string;
}

export interface ProjectDraft {
  name: string;
  projectNumber: string;
  customerName: string;
  description: string;
  status: string;
  billingMethod: string;
  hourlyRate: number;
  fixedAmount: number;
  budgetHours: number;
  budgetAmount: number;
  currency: string;
}

export interface ExpenseDraft {
  expenseDate: string;
  vendor: string;
  customerName: string;
  projectName: string;
  categoryName: string;
  description: string;
  amount: number;
  taxPercent: number;
  currency: string;
  paymentMethod: string;
  referenceNumber: string;
  billable: string;
  notes: string;
}

export interface QuoteLineDraft {
  name: string;
  description: string;
  itemName: string;
  quantity: number;
  rate: number;
  discount: number;
  tax: number;
  amount: number;
}

export interface QuoteDraft {
  quoteNumber: string;
  customerName: string;
  projectName: string;
  quoteDate: string;
  expiryDate: string;
  status: string;
  currency: string;
  referenceNumber: string;
  subTotal: number;
  discountPercent: number;
  discount: number;
  tax: number;
  shipping: number;
  adjustment: number;
  total: number;
  notes: string;
  terms: string;
  lines: QuoteLineDraft[];
}

export interface InvoiceLineDraft {
  title: string;
  description: string;
  itemName: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceDraft {
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;
  status: string;
  currency: string;
  subTotal: number;
  total: number;
  balance: number;
  discountPercent: number;
  notes: string;
  recipientEmail: string;
  lines: InvoiceLineDraft[];
}

export interface PaymentAppliedDraft {
  invoiceNumber: string;
  amount: number;
}

export interface PaymentDraft {
  paymentNumber: string;
  customerName: string;
  paymentDate: string;
  paymentMode: string;
  referenceNo: string;
  currency: string;
  amount: number;
  bankCharges: number;
  status: string;
  notes: string;
  createdTime: string;
  applied: PaymentAppliedDraft[];
}

export interface ImportDrafts {
  customers?: CustomerDraft[];
  items?: ItemDraft[];
  projects?: ProjectDraft[];
  expenses?: ExpenseDraft[];
  quotes?: QuoteDraft[];
  invoices?: InvoiceDraft[];
  payments?: PaymentDraft[];
}

export type RowStatus = "new" | "exists" | "error";

export interface ImportIssue {
  entity: EntityKey;
  index: number;
  message: string;
}

export interface ImportResult {
  statuses: Partial<Record<EntityKey, RowStatus[]>>;
  errors: ImportIssue[];
  warnings: string[];
}
