import { useCallback } from 'react';
import useCustomerData from './useCustomers';
import useUpdateCustomerStatus from './useCustomerUpdateStatus';
import useDeleteCustomer from './useCustomerDelete';
import useCustomerActions from './useCustomerActions';

export const useCustomerList = () => {
    const {
        loading,
        refetch,
        statusFilter,
        setStatusFilter,
        dropdownOpen,
        setDropdownOpen,
        selectedIds,
        setSelectedIds,
        filteredCustomers,
    } = useCustomerData();

    const {
        updateStatus,
        loading: statusLoading,
        alert: statusAlert,
        dismissAlert: dismissStatusAlert
    } = useUpdateCustomerStatus();

    const {
        deleteCustomers,
        loading: deleteLoading,
        alert: deleteAlert,
        dismissAlert: dismissDeleteAlert,
        confirmDialog,
        confirmDelete,
        hideConfirmDialog,
    } = useDeleteCustomer();

    // Alert from hooks
    const alert = statusAlert.show ? statusAlert : deleteAlert.show ? deleteAlert : { show: false, type: 'info' as const, message: '' };

    const dismissAlert = useCallback(() => {
        dismissStatusAlert();
        dismissDeleteAlert();
    }, [dismissStatusAlert, dismissDeleteAlert]);

    const { handleNew, handleSetActive, handleSetInactive, handleDelete, handleEdit, handleRowClick } =
        useCustomerActions({
            selectedIds,
            setSelectedIds,
            updateStatus,
            deleteCustomers: (ids, cb) => deleteCustomers(ids.map(String), cb),
            refetch
        });

    const busy = loading || statusLoading || deleteLoading;

    const onSelectAll = useCallback((checked: boolean) => {
        setSelectedIds(checked ? filteredCustomers.map((c) => c.id) : []);
    }, [filteredCustomers, setSelectedIds]);

    const onSelectRow = useCallback((id: string | number, checked: boolean) => {
        setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
    }, [setSelectedIds]);

    return {
        loading: busy,
        statusFilter,
        setStatusFilter,
        dropdownOpen,
        setDropdownOpen,
        selectedIds,
        setSelectedIds,
        filteredCustomers,
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

export default useCustomerList;
