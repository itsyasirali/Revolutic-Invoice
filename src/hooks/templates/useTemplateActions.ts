import { useNavigate } from 'react-router-dom';
import useDeleteTemplates from './useDeleteTemplates';
import useSetDefaultTemplate from './useSetDefaultTemplate';
import type { UseTemplateActionsProps, UseTemplateActionsReturn } from '../../types/template.d';
const useTemplateActions = ({
    selectedIds,
    setSelectedIds,
    refetch,
}: UseTemplateActionsProps): UseTemplateActionsReturn => {
    const navigate = useNavigate();
    const {
        deleteTemplates,
        confirmDialog,
        confirmDelete: executeDelete,
        hideConfirmDialog,
    } = useDeleteTemplates();
    const { setDefaultTemplate } = useSetDefaultTemplate();

    const handleDelete = (ids?: string[]) => {
        const targets = ids || selectedIds;
        if (targets.length === 0) return;
        deleteTemplates(targets);
    };

    const confirmDelete = async () => {
        await executeDelete();
        setSelectedIds([]);
        await refetch();
        hideConfirmDialog();
    };

    const handleSetDefault = async (id: string) => {
        await setDefaultTemplate(id);
        await refetch();
    };

    const handleEdit = (id: string, template?: any) => {
        navigate(`/templates/edit/${id}`, { state: { template } });
    };

    const handlePreview = (id: string) => {
        navigate(`/templates/${id}`);
    };

    return {
        handleDelete,
        handleSetDefault,
        handleEdit,
        handlePreview,
        confirmDialog,
        confirmDelete,
        hideConfirmDialog,
    };
};

export default useTemplateActions;
