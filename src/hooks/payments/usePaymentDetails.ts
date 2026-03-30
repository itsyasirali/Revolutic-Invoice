import { useState, useEffect } from 'react';
import axios from '../../Service/axios';
import type { Payment, UsePaymentDetailsReturn } from '../../types/Payment.d';

const usePaymentDetails = (id: string | undefined): UsePaymentDetailsReturn => {
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || id === 'undefined') {
            setLoading(false);
            return;
        }

        const fetchPayment = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/payments/${id}`);
                setPayment(response.data);
                setError(null);
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Failed to fetch payment details');
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [id]);

    return { payment, loading, error };
};

export default usePaymentDetails;
