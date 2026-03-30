import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { Customer } from '../../types/customer.d';

export const useCustomerDetails = () => {
    const location = useLocation();

    const customer = location.state?.customer as Customer | undefined;

    const primaryContact = useMemo(() => {
        const contact = customer?.contacts?.[0];
        return {
            name: contact
                ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '—'
                : '—',
            email: contact?.email || '—',
            phone: contact?.contact || '—',
        };
    }, [customer]);

    return {
        customer,
        primaryContact,
        loading: false,
    };
};
