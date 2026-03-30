import { useState } from 'react';
import axios from '../../Service/axios';
import type { UseSetDefaultTemplateReturn } from '../../types/template.d';

const useSetDefaultTemplate = (): UseSetDefaultTemplateReturn => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
        show: false,
        type: 'info',
        message: '',
    });

    const setDefaultTemplate = async (id: string) => {
        try {
            setLoading(true);

            await axios.put(`/templates/${id}/set-default`);

            setAlert({
                show: true,
                type: 'success',
                message: 'Template set as default successfully',
            });
        } catch (err: any) {
            console.error('Error setting default template:', err);
            setAlert({
                show: true,
                type: 'error',
                message: err.response?.data?.message || 'Failed to set default template',
            });
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = () => {
        setAlert({ show: false, type: 'info', message: '' });
    };

    return {
        setDefaultTemplate,
        loading,
        alert,
        dismissAlert,
    };
};

export default useSetDefaultTemplate;
