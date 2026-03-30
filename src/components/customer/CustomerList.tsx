import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Table from '../common/Table';
import StatusBadge from '../common/StatusBadge';
import CurrencyDisplay from '../common/CurrencyDisplay';
import Button from '../common/Button';
import PageHeader from '../common/PageHeader';
import ConfirmDialog from '../common/ConfirmDialog';
import AlertModal from '../common/AlertModal';
import useCustomerList from '../../hooks/customers/useCustomerList';
import type { Customer } from '../../types/customer.d';

const CustomerList: React.FC = () => {
  const {
    loading,
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
  } = useCustomerList();

  // Table column definitions
  const columns = [
    {
      key: 'displayName',
      label: 'NAME',
      render: (c: Customer) => (
        <span className="text-blue-500">{c.displayName || ''}</span>
      ),
    },
    {
      key: 'companyName',
      label: 'COMPANY NAME',
      render: (c: Customer) => (
        <span className="text-gray-900">{c.companyName || ''}</span>
      ),
    },
    {
      key: 'email',
      label: 'EMAIL',
      render: (c: Customer) => (
        <span className="text-gray-900">{c.contacts?.[0]?.email || ''}</span>
      ),
    },
    {
      key: 'phone',
      label: 'WORK PHONE',
      render: (c: Customer) => (
        <span className="text-gray-900">{c.contacts?.[0]?.contact || ''}</span>
      ),
    },
    {
      key: 'remaining',
      label: 'REMAINING',
      render: (c: Customer) => (
        <CurrencyDisplay
          amount={c.receivables || 0}
          currency={c.currency}
          className="text-gray-900"
        />
      ),
    },
    {
      key: 'received',
      label: 'RECEIVED',
      render: (c: Customer) => (
        <CurrencyDisplay
          amount={c.unusedCredits || 0}
          currency={c.currency}
          className="text-gray-900"
        />
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (c: Customer) => <StatusBadge status={c.status || 'Active'} />,
    },
  ];

  return (
    <div className="bg-white">
      <AlertModal
        isOpen={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={dismissAlert}
      />

      <ConfirmDialog
        isOpen={confirmDialog.show}
        title="Delete Customers"
        message={`Are you sure you want to delete ${confirmDialog.selectedIds.length} customer(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={hideConfirmDialog}
      />

      <PageHeader
        title={
          statusFilter === 'All'
            ? 'All Customers'
            : statusFilter === 'Active'
              ? 'Active Customers'
              : 'Inactive Customers'
        }
        showBackButton={statusFilter !== 'All'}
        onBack={() => setStatusFilter('All')}
        dropdown={{
          options: ['All', 'Active', 'inActive'].map((option) => ({
            label: option === 'All'
              ? 'All Customers'
              : option === 'Active'
                ? 'Active Customers'
                : 'Inactive Customers',
            value: option
          })),
          value: statusFilter,
          onChange: (value) => setStatusFilter(value),
          isOpen: dropdownOpen,
          onToggle: () => setDropdownOpen(!dropdownOpen)
        }}
        actions={
          <>
            <Button
              onClick={handleDelete}
              disabled={loading || selectedIds.length === 0}
              variant="danger"
              size="md"
            >
              Delete Selected
            </Button>

            <Button
              onClick={handleSetActive}
              disabled={loading || selectedIds.length === 0}
              variant="success"
              size="md"
            >
              Mark Active
            </Button>

            <Button
              onClick={handleSetInactive}
              disabled={loading || selectedIds.length === 0}
              variant="warning"
              size="md"
            >
              Mark Inactive
            </Button>

            <Button
              onClick={handleNew}
              disabled={loading}
              variant="primary"
              size="md"
            >
              New Customer
            </Button>
          </>
        }
      />

      <Table
        columns={columns}
        data={filteredCustomers}
        selectedIds={selectedIds}
        onSelectAll={onSelectAll}
        onSelectRow={onSelectRow}
        loading={loading}
        emptyMessage="No customers found"
        getRowId={(c) => c.id}
        onRowClick={(item) => handleRowClick(item)}
        rowActions={(c) => (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(c);
              }}
              className="p-1.5 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
              title="Edit Customer"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIds([c.id]);
                handleDelete();
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
              title="Delete Customer"
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

export default CustomerList;