import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Customer, UseCustomerActionsProps } from '../../types/customer.d';


const useCustomerActions = ({
  selectedIds,
  setSelectedIds,
  updateStatus,
  deleteCustomers,
  refetch,
  setOpenDropdownId
}: UseCustomerActionsProps) => {
  const navigate = useNavigate()

  const handleNew = useCallback(() => {
    navigate('/customers/new')
  }, [navigate])

  const handleSetActive = useCallback(async () => {
    await updateStatus(selectedIds, 'Active', refetch)
    setSelectedIds([])
  }, [selectedIds, updateStatus, refetch, setSelectedIds])

  const handleSetInactive = useCallback(async () => {
    await updateStatus(selectedIds, 'inActive', refetch)
    setSelectedIds([])
  }, [selectedIds, updateStatus, refetch, setSelectedIds])

  const handleDelete = useCallback(async () => {
    await deleteCustomers(selectedIds, refetch)
    setSelectedIds([])
  }, [selectedIds, deleteCustomers, refetch, setSelectedIds])

  const handleEdit = useCallback((customer: Customer) => {
    navigate(`/customers/edit/${customer.id}`, { state: { customer } })
    setOpenDropdownId?.(null)
  }, [navigate, setOpenDropdownId])

  const handleRowClick = (customer: Customer) => {
    navigate(`/customers/${customer.id}`, { state: { customer } });
  };

  return {
    handleNew,
    handleSetActive,
    handleSetInactive,
    handleDelete,
    handleEdit,
    handleRowClick
  }
}

export default useCustomerActions