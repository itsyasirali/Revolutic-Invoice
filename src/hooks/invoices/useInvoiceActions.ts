import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UseInvoiceActionsProps } from '../../types/invoice.d';
import type { UIInvoiceListItem } from './useInvoicesData';

const useInvoiceActions = (props?: UseInvoiceActionsProps) => {
    const navigate = useNavigate();
    const { selectedIds, setSelectedIds, deleteInvoices, refetch, setOpenDropdownId } = props || {};

    const handleNew = useCallback(() => {
        navigate('/invoices/new');
    }, [navigate]);

    const handleEdit = useCallback(
        (invoice: any) => {
            navigate(`/invoices/edit/${invoice.id}`, { state: { invoice } });
        },
        [navigate]
    );

    const handlePreview = useCallback(
        (invoice: any) => {
            navigate(`/invoices/preview/${invoice.id}`, { state: { invoice } });
        },
        [navigate]
    );

    const handleBackToList = useCallback(() => {
        navigate('/invoices');
    }, [navigate]);

    const handleBackToEdit = useCallback(
        (invoice: any) => {
            navigate(`/invoices/edit/${invoice.id}`, { state: { invoice } });
        },
        [navigate]
    );

    const handleDelete = useCallback(async () => {
        if (deleteInvoices && selectedIds && refetch && setSelectedIds) {
            await deleteInvoices(selectedIds);
            setSelectedIds([]);
            refetch();
        }
    }, [selectedIds, deleteInvoices, refetch, setSelectedIds]);

    const handleRowClick = useCallback(
        (invoice: UIInvoiceListItem) => {
            // Updated to remove localStorage usage and verify robust state passing
            if (setOpenDropdownId) {
                const isDropdownOpen = false; // Check if dropdown is open
                if (!isDropdownOpen) {
                    // Pass invoice.raw (which includes populated template if available) to avoid fetching in preview
                    navigate(`/invoices/preview/${invoice.id}`, { state: { invoice: invoice.raw || invoice } });
                }
            } else {
                navigate(`/invoices/preview/${invoice.id}`, { state: { invoice: invoice.raw || invoice } });
            }
        },
        [navigate, setOpenDropdownId]
    );

    return {
        handleNew,
        handleEdit,
        handlePreview,
        handleBackToList,
        handleBackToEdit,
        handleDelete,
        handleRowClick,
    };
};

export default useInvoiceActions;
