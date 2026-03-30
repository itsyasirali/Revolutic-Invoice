import { Customer } from './customer';

// Payment Status and Mode Types
export type PaymentStatus = 'Draft' | 'Paid';
export type PaymentMode = 'Cash' | 'Bank Transfer' | 'Bank Remittance' | 'Cheque' | 'Other';

// Complete Payment Document Interface
export interface Payment {
    id: string;
    userId?: string;
    paymentDate: string; // ISO string
    paymentNumber?: number;
    referenceNo?: string;
    customerId?: string;
    customerDisplayName: string;
    customerEmail?: string;
    customer?: Customer;
    paymentMode: PaymentMode;
    amountReceived: number;
    bankCharges?: number;
    tdsApplied?: boolean;
    reusableCredit?: number;
    remaining?: number;
    currency?: string;
    status?: PaymentStatus;
    appliedInvoices?: AppliedInvoice[];
    createdAt?: string | Date;
    updatedAt?: string | Date;
    templateId?: string | number;
    template?: any;
}

// ... existing code ...

export interface UsePaymentActionsReturn {
    handleNew: () => void;
    handleEdit: (id: string, data?: any) => void;
    handlePreview: (id: string, data?: any) => void;
    handleBackToList: () => void;
    handleBackToEdit: (id: string) => void;
    updateTemplate: (id: string, templateId: string) => Promise<void>;
}

// Applied Invoice Record
export interface AppliedInvoice {
    invoiceId: string;
    amount: number;
    invoiceNumber?: string;
    invoiceAmount?: number;
}

// Payment Form Data
export interface PaymentFormData {
    customerId: string;
    customerName: string;
    customerEmail: string;
    paymentDate: string;
    paymentMode: PaymentMode;
    referenceNo: string;
    amountReceived: number | string;
    bankCharges: number | string;
    currency: string;
    notes?: string;
}

// Payment List Item for UI Display
export interface PaymentListItem {
    id: string;
    paymentDate: string;
    paymentNumber?: number;
    referenceNo?: string;
    customerDisplayName: string;
    customerEmail?: string;
    paymentMode: PaymentMode;
    amountReceived: number;
    bankCharges?: number;
    currency?: string;
    status?: PaymentStatus;
    appliedInvoices?: AppliedInvoice[];
}

// Create Payment Payload
export interface CreatePaymentPayload {
    paymentDate: string; // YYYY-MM-DD
    paymentNumber?: number;
    referenceNo?: string;
    customerId: string;
    customerDisplayName: string;
    customerEmail?: string;
    paymentMode: PaymentMode;
    amountReceived: number;
    bankCharges?: number;
    tdsApplied?: boolean;
    currency?: string;
    status?: PaymentStatus;
    appliedInvoices?: AppliedInvoice[];
}

// Update Payment Payload
export type UpdatePaymentPayload = Partial<
    Pick<
        Payment,
        | 'paymentDate'
        | 'paymentNumber'
        | 'referenceNo'
        | 'customerId'
        | 'customerDisplayName'
        | 'customerEmail'
        | 'paymentMode'
        | 'amountReceived'
        | 'bankCharges'
        | 'tdsApplied'
        | 'currency'
        | 'status'
        | 'appliedInvoices'
    >
>;

// Helper Types
export interface InvoiceDetail {
    id: string;
    number: string;
    total: number;
    received: number;
    remaining: number;
    status: string;
    dueDate?: string;
    currency?: string;
}

export interface CustomerOption {
    id: string;
    displayName: string;
    email?: string;
    companyName?: string;
    currency?: string;
}

// Hook Return Types

export interface UsePaymentsReturn {
    payments: Payment[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    updatePayment: (paymentId: string, payload: UpdatePaymentPayload) => Promise<void>;
    deletePayments: (paymentIds: string[]) => Promise<void>;
    mutating: boolean;
    mutateError: string | null;
}

export interface UsePaymentsListReturn {
    payments: Payment[];
    rawPayments: Payment[];
    loading: boolean;
    deleting: boolean;
    mutateError: string | null;
    alert: { show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string };
    confirmDialog: { show: boolean; selectedIds: string[] };
    confirmDelete: () => Promise<void>;
    hideConfirmDialog: () => void;
    dismissAlert: () => void;
    refetch: () => Promise<void>;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    dropdownOpen: boolean;
    setDropdownOpen: (open: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    modeFilter: 'All' | PaymentMode;
    setModeFilter: (mode: 'All' | PaymentMode) => void;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string | number, checked: boolean) => void;
    handleNew: () => void;
    handleEditSelected: () => void;
    handleDeleteSelected: () => void;
    clearSelection: () => void;
}

export interface UseCreatePaymentReturn {
    amountReceived: number | '';
    setAmountReceived: (value: number | '') => void;
    bankCharges: number | '';
    setBankCharges: (value: number | '') => void;
    paymentDate: string;
    setPaymentDate: (value: string) => void;
    paymentNumber: number | '';
    setPaymentNumber: (value: number | '') => void;
    paymentMode: PaymentMode;
    setPaymentMode: (value: PaymentMode) => void;
    referenceNo: string;
    setReferenceNo: (value: string) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    isDropdownOpen: boolean;
    openDropdown: () => void;
    closeDropdown: () => void;
    filteredCustomers: CustomerOption[];
    customersLoading: boolean;
    handleCustomerSelect: (customer: CustomerOption) => void;
    selectedCustomer: CustomerOption | null;
    selectedCustomerId: string;
    appliedAmounts: Record<string, number>;
    handleAppliedAmountChange: (invoiceId: string, value: string) => void;
    handlePayInFull: (invoiceId: string, remaining: number) => void;
    handleClearApplied: () => void;
    payAllRemaining: boolean;
    handlePayAllRemainingToggle: () => void;
    unpaidInvoices: InvoiceDetail[];
    currency: string;
    totalApplied: number;
    amountInExcess: number;
    formatAmount: (value: number) => string;
    handleSubmit: (event?: React.FormEvent<HTMLFormElement>, saveMode?: 'draft' | 'paid' | 'send') => Promise<{ success: boolean; paymentId?: string; mode?: string; error?: string }>;
    creating: boolean;
    createError: string | null;
    handleCancel: () => void;
}



export interface UseSendPaymentReturn {
    sendPayment: (paymentId: string, recipients: string[]) => Promise<any>;
    loading: boolean;
    alert: {
        show: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
    };
    dismissAlert: () => void;
}

export interface UsePaymentDetailsReturn {
    payment: Payment | null;
    loading: boolean;
    error: string | null;
}

export interface UsePaymentFormReturn {
    isEditMode: boolean;
    paymentData: PaymentFormData;
    setPaymentData: React.Dispatch<React.SetStateAction<PaymentFormData>>;
    customerSearchTerm: string;
    setCustomerSearchTerm: (value: string) => void;
    customerDropdownOpen: boolean;
    setCustomerDropdownOpen: (open: boolean) => void;
    selectedCustomerData: any;
    setSelectedCustomerData: (data: any) => void;
    unpaidInvoices: any[];
    setUnpaidInvoices: (invoices: any[]) => void;
    appliedAmounts: Record<string, number>;
    setAppliedAmounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    payAllRemaining: boolean;
    setPayAllRemaining: (value: boolean) => void;
    isSubmitting: boolean;
    isSaving: boolean;
    filteredCustomers: any[];
    totalApplied: number;
    amountInExcess: number;
    selectCustomer: (customer: any) => void;
    handlePayAllRemainingToggle: () => void;
    handleAppliedAmountChange: (invoiceId: string, value: string) => void;
    handlePayInFull: (invoiceId: string, remaining: number) => void;
    handleSaveDraft: () => Promise<void>;
    handleSaveAndSend: () => Promise<void>;
    customersLoading: boolean;
    isFormValid: boolean;
    paymentModeOptions: Array<{ value: string; label: string }>;
}

