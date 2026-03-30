import { useState, useCallback } from 'react';
import useItemsData from './useItems';
import useUpdateItemStatus from './useItemUpdateStatus';
import useDeleteItems from './useItemsDelete';
import useItemActions from './useItemActions';

export const useItemList = () => {
    const { items, loading, refetch } = useItemsData();
    const { updateStatus, loading: statusLoading, alert: statusAlert, dismissAlert: dismissStatusAlert } = useUpdateItemStatus();
    const {
        deleteItems,
        loading: deleteLoading,
        alert: deleteAlert,
        dismissAlert: dismissDeleteAlert,
        confirmDialog,
        confirmDelete,
        hideConfirmDialog,
    } = useDeleteItems();

    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [, setOpenDropdownId] = useState<string | number | null>(null);

    // Alert from hooks (Success/Error)
    const alert = statusAlert.show ? statusAlert : deleteAlert.show ? deleteAlert : { show: false, type: 'info' as const, message: '' };

    const dismissAlert = useCallback(() => {
        dismissStatusAlert();
        dismissDeleteAlert();
    }, [dismissStatusAlert, dismissDeleteAlert]);

    const { handleNew, handleSetActive, handleSetInactive, handleDelete, handleEdit, handleRowClick } =
        useItemActions({
            selectedIds,
            setSelectedIds,
            updateStatus,
            deleteItems,
            refetch,
            setOpenDropdownId
        });

    const busy = loading || statusLoading || deleteLoading;

    const filteredItems = statusFilter === 'All'
        ? items
        : items.filter((i) => (i.status || '').toLowerCase() === statusFilter.toLowerCase());

    const onSelectAll = useCallback((checked: boolean) => {
        setSelectedIds(checked ? filteredItems.map((i) => i.id) : []);
    }, [filteredItems]);

    const onSelectRow = useCallback((id: string | number, checked: boolean) => {
        setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
    }, []);

    return {
        loading: busy,
        statusFilter,
        setStatusFilter,
        dropdownOpen,
        setDropdownOpen,
        selectedIds,
        setSelectedIds,
        filteredItems,
        alert,
        dismissAlert,
        confirmDialog,
        confirmDelete,
        hideConfirmDialog,
        handleNew,
        handleSetActive,
        handleSetInactive,
        handleDelete,
        handleEdit,
        handleRowClick,
        onSelectAll,
        onSelectRow,
    };
};

export default useItemList;
