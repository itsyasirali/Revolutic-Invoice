import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../Service/axios';
import type { UsePaymentActionsReturn } from '../../types/Payment.d';

const usePaymentActions = (): UsePaymentActionsReturn => {
    const navigate = useNavigate();

    const handleNew = useCallback(() => {
        sessionStorage.removeItem('payment');
        localStorage.removeItem('paymentPreviewData');
        navigate('/payments/new');
    }, [navigate]);

    const handlePreview = useCallback((id: string, data?: any) => {
        if (data) {
            localStorage.setItem('paymentPreviewData', JSON.stringify(data));
        }
        navigate(`/payments/preview/${id}`, { state: { payment: data } });
    }, [navigate]);

    const handleEdit = useCallback((id: string, data?: any) => {
        navigate(`/payments/edit/${id}`, { state: { payment: data } });
    }, [navigate]);

    const handleBackToList = useCallback(() => {
        localStorage.removeItem('paymentPreviewData');
        navigate('/payments');
    }, [navigate]);

    const handleBackToEdit = useCallback((id: string) => {
        localStorage.removeItem('paymentPreviewData');
        navigate(`/payments/edit/${id}`);
    }, [navigate]);

    const updateTemplate = useCallback(async (id: string, templateId: string) => {
        await axios.put(`/payments/${id}`, { templateId });
    }, []);

    return {
        handleNew,
        handlePreview,
        handleEdit,
        handleBackToList,
        handleBackToEdit,
        updateTemplate,
    };
};

export default usePaymentActions;
