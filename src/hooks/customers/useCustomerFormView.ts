import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerDetails } from './useCustomerDetails';
import { useCustomerForm as useDomainCustomerForm } from './useCustomerForm';

export const useCustomerFormView = () => {
    const navigate = useNavigate();
    const { customer, loading: fetchingCustomer } = useCustomerDetails();

    const {
        customerType,
        setCustomerType,
        handleFileChange,
        handleSubmit,
        loading: saving,
        existingFiles,
        setExistingFiles,
        alert,
        dismissAlert,
    } = useDomainCustomerForm(customer);

    useEffect(() => {
        if (customer) {
            setCustomerType(customer.customerType || 'Individual');
            setExistingFiles(customer.documents || []);
        }
    }, [customer, setCustomerType, setExistingFiles]);

    const handleRemoveExistingFile = useCallback((index: number) => {
        setExistingFiles((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    }, [setExistingFiles]);

    const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmit(e as React.FormEvent<HTMLFormElement>, customer || undefined, existingFiles);
        navigate('/customers');
    }, [customer, existingFiles, handleSubmit, navigate]);

    const handleCancel = useCallback(() => {
        navigate('/customers');
    }, [navigate]);

    return {
        customer,
        loading: fetchingCustomer,
        saving,
        customerType,
        setCustomerType,
        handleFileChange,
        existingFiles,
        handleRemoveExistingFile,
        handleFormSubmit,
        handleCancel,
        alert,
        dismissAlert,
    };
};

export default useCustomerFormView;
