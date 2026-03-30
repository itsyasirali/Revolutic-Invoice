import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Item, UseItemActionsProps } from '../../types/items.d';

const useItemActions = ({
    selectedIds,
    setSelectedIds,
    updateStatus,
    deleteItems,
    refetch,
    setOpenDropdownId
}: UseItemActionsProps) => {
    const navigate = useNavigate();

    const handleNew = useCallback(() => {
        navigate('/items/new');
    }, [navigate]);

    const handleSetActive = useCallback(async () => {
        await updateStatus(selectedIds, 'Active', refetch);
        setSelectedIds([]);
    }, [selectedIds, updateStatus, refetch, setSelectedIds]);

    const handleSetInactive = useCallback(async () => {
        await updateStatus(selectedIds, 'inActive', refetch);
        setSelectedIds([]);
    }, [selectedIds, updateStatus, refetch, setSelectedIds]);

    const handleDelete = useCallback(async () => {
        await deleteItems(selectedIds, refetch);
        setSelectedIds([]);
    }, [selectedIds, deleteItems, refetch, setSelectedIds]);

    const handleEdit = useCallback((item: Item) => {
        navigate(`/items/edit/${item.id}`, { state: { item } });
        setOpenDropdownId?.(null);
    }, [navigate, setOpenDropdownId]);

    const handleRowClick = (item: Item) => {
        navigate(`/items/${item.id}`, { state: { item } });
    };

    return {
        handleNew,
        handleSetActive,
        handleSetInactive,
        handleDelete,
        handleEdit,
        handleRowClick
    };
};

export default useItemActions;
