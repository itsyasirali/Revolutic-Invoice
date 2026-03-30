import { useMemo } from 'react';
import type { Customer, UIInvoiceListItem, PaymentTransaction } from '../../types/customer.d';

export const useCustomerFinancials = (customer: Customer | null | undefined) => {
    const financials = useMemo(() => ({
        received: customer?.unusedCredits || 0,
        remaining: customer?.receivables || 0,
    }), [customer]);

    const customerInvoices = useMemo<UIInvoiceListItem[]>(() => {
        if (!customer?.invoices) return [];

        return customer.invoices.map((inv: any) => ({
            id: inv.id,
            invoice: inv.invoiceNumber || inv.invoice || '',
            name: customer.displayName || '',
            email: customer.contacts?.[0]?.email || '',
            date: inv.invoiceDate || inv.date,
            dueDate: inv.dueDate,
            amount: inv.total?.toString() || '0',
            status: {
                tooltip: inv.status,
                color: inv.status?.toLowerCase() === 'paid' ? 'success' :
                    inv.status?.toLowerCase() === 'overdue' ? 'danger' :
                        inv.status?.toLowerCase() === 'partially paid' ? 'warning' : 'default'
            },
            overdueDays: 0, // Calculate if needed
            raw: inv,
            documents: inv.documents
        }));
    }, [customer]);

    const customerTransactions = useMemo<PaymentTransaction[]>(() => {
        return customer?.payments || [];
    }, [customer]);

    return {
        financials,
        customerInvoices,
        customerTransactions
    };
};
