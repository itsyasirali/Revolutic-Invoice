import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useInvoicesData, { type UIInvoiceListItem } from './useInvoicesData';
import useDeleteInvoices from './useDeleteInvoices';
import useInvoiceActions from './useInvoiceActions';

const useInvoiceList = () => {
    const navigate = useNavigate();
    const { items, loading, refetch } = useInvoicesData();
    const {
        deleteInvoices,
        loading: deleteLoading,
        alert: deleteAlert,
        dismissAlert: dismissDeleteAlert,
        confirmDialog,
        confirmDelete,
        hideConfirmDialog
    } = useDeleteInvoices();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Unified alert state
    const [alert, setAlert] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
        show: false,
        type: 'info',
        message: ''
    });

    const dismissAlert = useCallback(() => {
        setAlert({ show: false, type: 'info', message: '' });
        dismissDeleteAlert();
    }, [dismissDeleteAlert]);

    const { handleNew, handleDelete, handleRowClick } = useInvoiceActions({
        selectedIds,
        setSelectedIds,
        deleteInvoices,
        refetch
    });

    const filteredInvoices = useMemo(() => {
        if (statusFilter === 'All') return items;
        return items.filter((invoice: UIInvoiceListItem) => {
            const statusValue = invoice.status?.tooltip?.toLowerCase() || '';
            return statusValue === statusFilter.toLowerCase();
        });
    }, [items, statusFilter]);

    const onSelectAll = useCallback((checked: boolean) => {
        setSelectedIds(checked ? filteredInvoices.map((i: UIInvoiceListItem) => String(i.id)) : []);
    }, [filteredInvoices]);

    const onSelectRow = useCallback((id: string | number, checked: boolean) => {
        const stringId = String(id);
        setSelectedIds((prev) => (checked ? [...prev, stringId] : prev.filter((x) => x !== stringId)));
    }, []);

    const handleEdit = useCallback((invoice: UIInvoiceListItem) => {
        navigate(`/invoices/edit/${invoice.id}`, { state: { invoice: invoice.raw || invoice } });
    }, [navigate]);

    return {
        // State
        filteredInvoices,
        selectedIds,
        setSelectedIds,
        statusFilter,
        setStatusFilter,
        dropdownOpen,
        setDropdownOpen,
        loading: loading || deleteLoading,
        alert: deleteAlert.show ? deleteAlert : alert,
        confirmDialog,

        // Handlers
        onSelectAll,
        onSelectRow,
        handleNew,
        handleEdit,
        handleDelete,
        handleRowClick,
        confirmDelete,
        hideConfirmDialog,
        dismissAlert,
        refetch,
    };
};

export default useInvoiceList;
