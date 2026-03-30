import { useState, useCallback } from 'react';
import axios from '../../Service/axios';
import type { UseSendPaymentReturn } from '../../types/Payment.d';

type AlertState = {
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
};

const useSendPayment = (): UseSendPaymentReturn => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<AlertState>({ show: false, type: 'info', message: '' });

    const dismissAlert = useCallback(() => {
        setAlert({ show: false, type: 'info', message: '' });
    }, []);

    const sendPayment = useCallback(async (id: string, recipientEmails: string[]) => {
        try {
            setLoading(true);
            dismissAlert();

            const response = await axios.post(
                `/payments/${id}/send`,
                { to: recipientEmails }
            );

            setAlert({
                show: true,
                type: 'success',
                message: response.data.message || 'Payment receipt sent successfully',
            });

            return { success: true, data: response.data };
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to send payment receipt';
            setAlert({
                show: true,
                type: 'error',
                message,
            });
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, [dismissAlert]);

    return {
        sendPayment,
        loading,
        alert,
        dismissAlert,
    };
};

export default useSendPayment;
