import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Table from '../common/Table';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import PageHeader from '../common/PageHeader';
import ConfirmDialog from '../common/ConfirmDialog';
import AlertModal from '../common/AlertModal';
import useItemList from '../../hooks/items/useItemList';
import type { Item } from '../../types/items.d';

const ItemList: React.FC = () => {
  const {
    loading,
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
  } = useItemList();

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'NAME',
      render: (i: Item) => (
        <span className="text-blue-500">
          {i.name || ''}
        </span>
      )
    },
    {
      key: 'unit',
      label: 'UNIT',
      render: (i: Item) => (
        <span className="text-gray-900">
          {i.unit || ''}
        </span>
      )
    },
    {
      key: 'sellingPrice',
      label: 'SELLING PRICE',
      render: (i: Item) => (
        <span className="text-gray-900">
          {i.sellingPrice !== undefined
            ? `${i.sellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : ''}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'DESCRIPTION',
      render: (i: Item) => (
        <span className="text-gray-700 leading-relaxed">
          {i.description || ''}
        </span>
      )
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (i: Item) => <StatusBadge status={i.status || 'Active'} />,
    }
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
        title="Delete Items"
        message={`Are you sure you want to delete ${confirmDialog.selectedIds.length} item(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={hideConfirmDialog}
      />

      <PageHeader
        title={
          statusFilter === 'All'
            ? 'All Items'
            : statusFilter === 'Active'
              ? 'Active Items'
              : 'Inactive Items'
        }
        showBackButton={statusFilter !== 'All'}
        onBack={() => setStatusFilter('All')}
        dropdown={{
          options: ['All', 'Active', 'inActive'].map((option) => ({
            label: option === 'All'
              ? 'All Items'
              : option === 'Active'
                ? 'Active Items'
                : 'Inactive Items',
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
              New Item
            </Button>
          </>
        }
      />



      <Table<Item>
        columns={columns}
        data={filteredItems}
        selectedIds={selectedIds}
        onSelectAll={onSelectAll}
        onSelectRow={onSelectRow}
        loading={loading}
        emptyMessage="No items found"
        getRowId={(i) => String(i.id)}
        onRowClick={handleRowClick}
        rowActions={(i) => (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(i);
              }}
              className="p-1.5 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
              title="Edit Item"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // For simplicity, we trigger the bulk delete flow for a single item
                // but we might want a separate confirmation here if desired.
                // For now, let's just use the bulk delete confirmation by setting selectedIds to just this one.
                setSelectedIds([i.id]);
                handleDelete();
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
              title="Delete Item"
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

export default ItemList;