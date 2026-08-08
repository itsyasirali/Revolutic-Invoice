"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import type { Customer } from "@/types/customer";

const useCustomerData = (
  options: { fetchOnMount?: boolean } = { fetchOnMount: true },
) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  // Initialize loading to true if we are going to fetch on mount to avoid cascading renders
  const [loading, setLoading] = useState(options.fetchOnMount ?? true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = useCallback(async (isInitialFetch = false) => {
    // Only set loading to true if it's not the initial fetch (since it's already true)
    if (!isInitialFetch) {
      setLoading(true);
    }
    try {
      const response = await axios.get(`/customers`);
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.fetchOnMount) {
      // Execute as a microtask to avoid synchronous execution warnings
      Promise.resolve().then(() => fetchCustomers(true));
    }
  }, [fetchCustomers, options.fetchOnMount]);

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return customers.filter((c: Customer) => {
      const matchesStatus =
        statusFilter === "All" ||
        c.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch =
        !query ||
        (c.displayName || "").toLowerCase().includes(query) ||
        (c.companyName || "").toLowerCase().includes(query) ||
        (c.contacts?.[0]?.email || "").toLowerCase().includes(query) ||
        (c.contacts?.[0]?.contact || "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [customers, statusFilter, searchQuery]);

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
    searchQuery,
    setSearchQuery,
  };
};

export default useCustomerData;
