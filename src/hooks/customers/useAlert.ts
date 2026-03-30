import { useState, useCallback } from 'react';
import type { AlertState } from '../../types/customer.d';

export const useAlert = () => {
    const [alert, setAlert] = useState<AlertState>({
        show: false,
        type: 'info',
        message: '',
    });

    const showAlert = useCallback((type: AlertState['type'], message: string) => {
        setAlert({ show: true, type, message });
    }, []);

    const dismissAlert = useCallback(() => {
        setAlert({ show: false, type: 'info', message: '' });
    }, []);

    return {
        alert,
        showAlert,
        dismissAlert,
    };
};

export default useAlert;
