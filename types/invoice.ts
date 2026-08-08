import type { Customer } from "./customer";

// --- Backend request payload shapes (mirrors api/src/invoices/dto/*) ---

export interface InvoiceItemPayload {
  itemId?: number;
  title: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CreateInvoicePayload {
  customerId: number;
  templateId?: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  items?: InvoiceItemPayload[];
  subTotal?: number;
  total?: number;
  received?: number;
  remaining?: number;
  previousRemaining?: number;
  currency?: string;
  notes?: string;
  discountPercent?: number;
}

export type UpdateInvoicePayload = Partial<CreateInvoicePayload>;

export interface SendInvoicePayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  message?: string;
  attachPDF?: boolean;
  invoiceData?: unknown; // Allow passing full invoice data for drafts
}

// --- Frontend-facing shapes (mirrors src/types/invoice.d.ts) ---

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled" | "Partially Paid";

export interface InvoiceItemInput {
  itemId?: string;
  title: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CreateInvoiceInput {
  invoiceNumber: string;
  invoiceLabel?: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate?: string;

  customerId: string;
  customerDisplayName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;

  currency: string; // ISO code like PKR, USD

  items: InvoiceItemInput[];

  subTotal: number;
  taxPercent: number;
  discountPercent: number;
  shipping: number;
  total: number;

  notes?: string;
  status?: InvoiceStatus;
  recipients?: string[]; // emails to send invoice to
  // transient fields (not persisted) for email/preview
  previousBalance?: number;
  totalDue?: number;
}

export interface InvoiceCustomerContactSnapshot {
  firstName?: string;
  lastName?: string;
  email?: string;
  contact?: string;
}

export type InvoiceCustomerSnapshot = Partial<Omit<Customer, "id" | "contacts">> & {
  id?: string;
  contacts?: InvoiceCustomerContactSnapshot[];
  [key: string]: unknown;
};

export interface CreateInvoiceResponse {
  id: string;
  invoice: unknown;
  emailed?: boolean;
  emailError?: string;
}

// Complete Invoice document interface
export interface Invoice {
  id: string;
  userId?: string;
  invoiceNumber: string;
  invoiceLabel?: string;
  invoiceDate: string | Date;
  dueDate?: string | Date;
  templateId?: string | number | { id?: string | number; [key: string]: unknown };
  template?: unknown;

  customerId: string | number | { id?: string | number; displayName?: string; companyName?: string; contacts?: unknown[] };
  customerDisplayName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;

  currency: string;

  items: Array<{
    itemId?: string | number | { id?: string | number; name?: string; unit?: string; [key: string]: unknown };
    title?: string;
    name?: string;
    description?: string;
    quantity: number;
    rate: number;
    amount: number;
    unit?: string;
  }>;

  subTotal: number;
  taxPercent: number;
  discountPercent: number;
  shipping: number;
  total: number;

  received?: number;
  remaining?: number;
  previousRemaining?: number;

  status: InvoiceStatus;
  notes?: string;
  recipients?: string[];
  documents?: string[];

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Invoice list item for UI display
export interface InvoiceListItem {
  id: string;
  invoice: string;
  name: string;
  email: string;
  date: string;
  dueDate?: string;
  amount: string;
  currency: string;
  status: {
    tooltip: string;
    color: "success" | "danger" | "warning";
  };
  overdueDays?: number;
  documents?: unknown[];
  raw: unknown;
}

// Invoice item for form/table display
export interface InvoiceItem {
  id: number;
  itemId?: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

// Invoice form data
export interface InvoiceFormData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  terms: string;
  dueDate: string;
  notes: string;
  currency: string;
  recipients: string[];
  discountPercent?: number;
  templateId?: string;
}

// Customer type for invoice form
export interface InvoiceCustomer {
  id?: string | number;
  displayName?: string;
  companyName?: string;
  contacts?: Array<{
    email?: string;
    contact?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  }>;
  address?: string;
  currency?: string;
  receivables?: number;
}

// Item type for invoice form
export interface InvoiceItemData {
  id?: number;
  name?: string;
  unit?: string | null;
  sellingPrice?: number;
  description?: string;
}

// Alert/Notification state
export interface AlertState {
  show: boolean;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

// Hook Props Interfaces

export interface UseInvoiceActionsProps {
  selectedIds?: string[];
  setSelectedIds?: (ids: string[]) => void;
  deleteInvoices?: (ids: string[], callback?: () => void) => Promise<void>;
  refetch?: () => void;
  setOpenDropdownId?: (id: string | null) => void;
}

export interface UseInvoiceFormProps {
  invoiceId?: string;
  isEditMode: boolean;
}

export interface UseDeleteInvoicesReturn {
  deleteInvoices: (ids: string[]) => Promise<void>;
  loading: boolean;
  alert: AlertState;
  dismissAlert: () => void;
  confirmDialog: {
    show: boolean;
    selectedIds: string[];
  };
  confirmDelete: () => Promise<void>;
  hideConfirmDialog: () => void;
}

export interface UseSendInvoiceReturn {
  sendInvoice: (invoiceId: string, recipients: string[], totalRemaining?: number) => Promise<unknown>;
  loading: boolean;
  alert: AlertState;
  dismissAlert: () => void;
}
