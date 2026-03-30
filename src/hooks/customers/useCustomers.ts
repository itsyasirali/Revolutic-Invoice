import { useState, useCallback, useEffect } from 'react';
import axios from '../../Service/axios';
import type { Customer } from '../../types/customer';

const useCustomerData = (options: { fetchOnMount?: boolean } = { fetchOnMount: true }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/customers`);
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.fetchOnMount) {
      fetchCustomers();
    }
  }, [fetchCustomers, options.fetchOnMount]);

  const filteredCustomers =
    statusFilter === 'All'
      ? customers
      : customers.filter(
        (c: Customer) => c.status?.toLowerCase() === statusFilter.toLowerCase()
      );

  return {
    customers,
    loading,
    refetch: fetchCustomers,
    statusFilter,
    setStatusFilter,
    dropdownOpen,
    setDropdownOpen,
    selectedIds,
    setSelectedIds,
    filteredCustomers,
  };
};

export default useCustomerData;