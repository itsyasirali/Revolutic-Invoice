import { useState, useCallback } from 'react';
import axios from '../../Service/axios';
import type { TemplateListItem, AlertState } from '../../types/template.d';

export interface UseCloneTemplateReturn {
    cloneTemplate: (template: TemplateListItem) => Promise<void>;
    loading: boolean;
    alert: AlertState;
    dismissAlert: () => void;
}

const useCloneTemplate = (onSuccess?: () => Promise<void>): UseCloneTemplateReturn => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<AlertState>({
        show: false,
        type: 'info',
        message: '',
    });

    const cloneTemplate = useCallback(async (template: TemplateListItem) => {
        try {
            setLoading(true);

            // Get the full template data from raw
            const templateData = template.raw;

            // Create clone payload - remove id and modify name
            const clonePayload = {
                ...templateData,
                templateName: `${templateData.templateName} (Copy)`,
                isDefault: false, // Clone should not be default
            };

            // Remove fields that shouldn't be cloned
            delete (clonePayload as any).id; // Backend uses 'id' not 'id'
            delete (clonePayload as any).userId;
            delete (clonePayload as any).createdAt;
            delete (clonePayload as any).updatedAt;

            await axios.post(`/templates`, clonePayload);

            setAlert({
                show: true,
                type: 'success',
                message: `Template "${template.name}" cloned successfully`,
            });

            // Refetch the list
            if (onSuccess) {
                await onSuccess();
            }
        } catch (err: any) {
            console.error('Error cloning template:', err);
            setAlert({
                show: true,
                type: 'error',
                message: err.response?.data?.message || 'Failed to clone template',
            });
        } finally {
            setLoading(false);
        }
    }, [onSuccess]);

    const dismissAlert = useCallback(() => {
        setAlert({ show: false, type: 'info', message: '' });
    }, []);

    return {
        cloneTemplate,
        loading,
        alert,
        dismissAlert,
    };
};

export default useCloneTemplate;
