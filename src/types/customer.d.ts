// Contact interface
export interface Contact {
  firstName?: string;
  lastName?: string;
  email?: string;
  contact?: string;
}

// Payment Transaction interface
export interface PaymentTransaction {
  id: string | number;
  id?: string | number;
  paymentDate: string | Date;
  paymentNumber?: number;
  referenceNo?: string;
  paymentMode: 'Cash' | 'Bank Transfer' | 'Bank Remittance' | 'Cheque' | 'Other';
  amountReceived: number;
  bankCharges?: number;
  currency?: string;
  appliedInvoices?: Array<{
    invoiceId: string | number;
    amount: number;
  }>;
}

// Customer type enum
export type CustomerType = 'Business' | 'Individual';

// Main Customer interface
export interface Customer {
  id: string | number;
  id?: string | number;
  userId: string;
  customerType: CustomerType;
  companyName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  currency?: string;
  address?: string;
  remarks?: string;
  documents?: string[];
  invoices?: any[];
  status?: string;
  contacts: Contact[];
  receivables?: number;
  unusedCredits?: number;
  payments?: PaymentTransaction[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// UI-specific types for invoice list items in customer details
export interface UIInvoiceListItem {
  id: string | number;
  invoice: string;
  name: string;
  email: string;
  date: string;
  dueDate: string;
  amount: string;
  status: {
    tooltip: string;
    color: 'success' | 'danger' | 'warning' | 'default';
  };
  overdueDays: number;
  raw: any;
  documents?: any[];
}

// Customer financials type
export interface CustomerFinancials {
  customerKey: string;
  remaining: number;
  received: number;
}

// Alert/Notification state
export interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// File handling types
export type MaybeFile = { url?: string; name?: string; path?: string } | string;

// Hook Props types
export interface UseCustomerActionsProps {
  selectedIds: (string | number)[];
  setSelectedIds: (ids: (string | number)[]) => void;
  updateStatus: (ids: textIds[], status: string, callback: () => void) => Promise<void>;
  deleteCustomers: (ids: (string | number)[], callback: () => void) => Promise<void>;
  refetch: () => void;
  setOpenDropdownId?: (id: string | number | null) => void;
}

export interface UseCustomerDetailsProps {
  customers: Customer[];
  invoiceItems: any[];
  deleteCustomers: (ids: (string | number)[], callback: () => void) => Promise<void>;
  deleteLoading: boolean;
}

// Contacts hook return type
export interface UseContactsReturn {
  contacts: Contact[];
  addContact: () => void;
  removeContact: (idx: number) => void;
  updateContact: (idx: number, field: keyof Contact, value: string) => void;
}

// Props for ContactsSection component
export interface ContactsSectionProps {
  initial?: Contact[];
}

// Customer form data interface
export interface CustomerFormData {
  id?: string;
  customerType?: string;
  companyName?: string;
  displayName?: string;
  currency?: string;
  address?: string;
  remarks?: string;
  documents?: File[];
  contacts?: Contact[];
}
