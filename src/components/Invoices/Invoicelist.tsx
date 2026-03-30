import { useMemo } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Table from '../common/Table';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import ConfirmDialog from '../common/ConfirmDialog';
import PageHeader from '../common/PageHeader';
import useInvoiceList from '../../hooks/invoices/useInvoiceList';
import type { UIInvoiceListItem } from '../../hooks/invoices/useInvoicesData';

const InvoiceList = () => {
  const {
    filteredInvoices,
    selectedIds,
    setSelectedIds,
    statusFilter,
    setStatusFilter,
    dropdownOpen,
    setDropdownOpen,
    loading,
    alert,
    confirmDialog,
    onSelectAll,
    onSelectRow,
    handleNew,
    handleEdit,
    handleDelete,
    handleRowClick,
    confirmDelete,
    hideConfirmDialog,
    dismissAlert,
  } = useInvoiceList();

  const columns = useMemo(
    () => [
      {
        key: 'invoice',
        label: 'INVOICE#',
        render: (inv: UIInvoiceListItem) => (
          <span className="font-bold text-gray-900">
            {inv.invoice}
          </span>
        ),
      },
      {
        key: 'name',
        label: 'CUSTOMER',
        render: (inv: UIInvoiceListItem) => (
          <span className="text-gray-900">
            {inv.name || ''}
          </span>
        ),
      },
      {
        key: 'email',
        label: 'EMAIL',
        render: (inv: UIInvoiceListItem) => (
          <span className="text-gray-600">
            {inv.email || ''}
          </span>
        ),
      },
      {
        key: 'date',
        label: 'DATE',
        render: (inv: UIInvoiceListItem) => (
          <span className="text-gray-600">
            {inv.date || ''}
          </span>
        ),
      },
      {
        key: 'dueDate',
        label: 'DUE DATE',
        render: (inv: UIInvoiceListItem) => (
          <span className="text-gray-600">
            {inv.dueDate || ''}
          </span>
        ),
      },
      {
        key: 'amount',
        label: 'AMOUNT',
        render: (inv: UIInvoiceListItem) => (
          <span className="text-gray-900 font-bold">
            {inv.amount || '0.00'} {inv.currency || 'PKR'}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'STATUS',
        render: (inv: UIInvoiceListItem) => (
          <StatusBadge status={inv.status?.tooltip || 'Draft'} />
        ),
      },
    ],
    []
  );

  const statusOptions = ['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Partially Paid'];

  return (
    <div className="bg-white">
      <PageHeader
        title={statusFilter === 'All' ? 'All Invoices' : `${statusFilter} Invoices`}
        onBack={() => setStatusFilter('All')}
        dropdown={{
          options: statusOptions.map(opt => ({ label: `${opt} Invoices`, value: opt })),
          value: statusFilter,
          onChange: setStatusFilter,
          isOpen: dropdownOpen,
          onToggle: () => setDropdownOpen(!dropdownOpen)
        }}
        actions={
          <Button
            onClick={handleNew}
            disabled={loading}
            variant="primary"
            size="md"
          >
            New Invoice
          </Button>
        }
      />

      <ConfirmDialog
        isOpen={alert.show}
        title={alert.type === 'success' ? 'Success' : alert.type === 'error' ? 'Error' : alert.type === 'warning' ? 'Warning' : 'Info'}
        message={alert.message}
        confirmText="OK"
        cancelText=""
        type={alert.type === 'error' ? 'danger' : alert.type}
        onConfirm={dismissAlert}
        onCancel={dismissAlert}
      />

      <ConfirmDialog
        isOpen={confirmDialog.show}
        title="Delete Invoices"
        message={`Are you sure you want to delete ${confirmDialog.selectedIds.length} invoice(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={hideConfirmDialog}
      />

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-white px-6 py-2.5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDelete}
              disabled={loading}
              variant="secondary"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete Selected
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center min-w-[32px] h-8 bg-gray-100 rounded-full px-2.5">
              <span className="text-xs font-medium text-gray-700">
                {selectedIds.length}
              </span>
            </div>
            <button
              onClick={() => setSelectedIds([])}
              className="text-red-500 hover:text-red-600 transition-colors text-xl font-medium"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Table<UIInvoiceListItem>
        columns={columns}
        data={filteredInvoices}
        selectedIds={selectedIds}
        onSelectAll={onSelectAll}
        onSelectRow={onSelectRow}
        loading={loading}
        emptyMessage="No invoices found"
        getRowId={(i) => String(i.id)}
        onRowClick={handleRowClick}
        rowActions={(inv) => (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(inv);
              }}
              className="p-1.5 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
              title="Edit Invoice"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIds([String(inv.id)]);
                handleDelete();
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
              title="Delete Invoice"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        showFilter
        showCheckbox
      />
    </div>
  );
};

export default InvoiceList;