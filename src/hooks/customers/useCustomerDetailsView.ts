import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeleteCustomer from './useCustomerDelete';
import { useCustomerDetails } from './useCustomerDetails';
import { useCustomerFinancials } from './useCustomerFinancials';

export type CustomerTab = 'overview' | 'invoices' | 'transactions';

export const useCustomerDetailsView = () => {
    const navigate = useNavigate();
    const { deleteCustomers, loading: deleteLoading } = useDeleteCustomer();

    const { customer, primaryContact, loading: customerLoading } = useCustomerDetails();
    const { financials, customerInvoices, customerTransactions } = useCustomerFinancials(customer);

    const [activeTab, setActiveTab] = useState<CustomerTab>('overview');

    const handleEdit = useCallback(() => {
        if (customer) {
            navigate(`/customers/edit/${customer.id}`, { state: { customer } });
        }
    }, [customer, navigate]);

    const handleDelete = useCallback(async () => {
        if (customer && customer.id) {
            await deleteCustomers([String(customer.id)], () => {
                navigate('/customers');
            });
        }
    }, [customer, deleteCustomers, navigate]);

    const handleBackClick = useCallback(() => {
        navigate('/customers');
    }, [navigate]);

    const handleInvoiceClick = useCallback((invoiceId: string | number) => {
        navigate(`/invoices/preview/${invoiceId}`);
    }, [navigate]);

    const handleTransactionClick = useCallback((transactionId: string | number) => {
        navigate(`/payments/preview/${transactionId}`);
    }, [navigate]);

    return {
        customer,
        primaryContact,
        loading: customerLoading || deleteLoading,
        deleteLoading,
        financials,
        customerInvoices,
        customerTransactions,
        activeTab,
        setActiveTab,
        handleEdit,
        handleDelete,
        handleBackClick,
        handleInvoiceClick,
        handleTransactionClick,
    };
};

export default useCustomerDetailsView;
