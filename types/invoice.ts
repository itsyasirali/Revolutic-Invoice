import type { TemplateListItem } from "./template";

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
  subject?: string;
  attachPDF?: boolean;
  invoiceData?: unknown; // Allow passing full invoice data for drafts
}

// --- Frontend-facing shapes (mirrors src/types/invoice.d.ts) ---

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled" | "Partially Paid" | "Written Off";

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

  // Source records (present on the invoice detail response)
  quote?: { id: number; quoteNumber: string } | null;
  expenses?: Array<{ id: number; expenseNumber: string }>;
  timeEntries?: Array<{ id: number; entryNumber: string }>;

  status: InvoiceStatus;
  notes?: string;
  recipients?: string[];
  documents?: string[];

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Invoice item for form/table display
export interface InvoiceItem {
  id: number;
  itemId?: string;
  name: string;
  description?: string;
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

export interface InvoiceListProps {
  initialInvoices?: any[];
}

export interface InvoiceTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: TemplateListItem) => void;
  currentTemplateId?: string;
}
