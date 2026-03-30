import { useState } from 'react';
import axios from '../../Service/axios';
import type { UseDeleteTemplatesReturn } from '../../types/template.d';
const useDeleteTemplates = (): UseDeleteTemplatesReturn => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
        show: false,
        type: 'info',
        message: '',
    });
    const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; selectedIds: string[] }>({
        show: false,
        selectedIds: [],
    });

    const deleteTemplates = async (ids: string[]) => {
        setConfirmDialog({ show: true, selectedIds: ids });
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);

            for (const id of confirmDialog.selectedIds) {
                await axios.delete(`/templates/${id}`);
            }

            setAlert({
                show: true,
                type: 'success',
                message: `${confirmDialog.selectedIds.length} template(s) deleted successfully`,
            });

            setConfirmDialog({ show: false, selectedIds: [] });
        } catch (err: any) {
            console.error('Error deleting templates:', err);
            setAlert({
                show: true,
                type: 'error',
                message: err.response?.data?.message || 'Failed to delete templates',
            });
        } finally {
            setLoading(false);
        }
    };

    const hideConfirmDialog = () => {
        setConfirmDialog({ show: false, selectedIds: [] });
    };

    const dismissAlert = () => {
        setAlert({ show: false, type: 'info', message: '' });
    };

    return {
        deleteTemplates,
        loading,
        alert,
        dismissAlert,
        confirmDialog,
        confirmDelete,
        hideConfirmDialog,
    };
};

export default useDeleteTemplates;
