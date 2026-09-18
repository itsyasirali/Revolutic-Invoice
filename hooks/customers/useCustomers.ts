"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { swrFetcher, SWR_KEYS } from "@/lib/swr";
import type { Customer } from "@/types/customer";

type CustomersApiResponse = {
  customers?: Customer[];
};

const useCustomerData = (
  options: { fetchOnMount?: boolean; initialCustomers?: Customer[] } = {
    fetchOnMount: true,
  },
) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  const shouldFetch = options.fetchOnMount ?? true;

  const { data, isLoading, isValidating, mutate } = useSWR<
    CustomersApiResponse | Customer[]
  >(shouldFetch ? SWR_KEYS.customers : null, swrFetcher, {
    fallbackData: options.initialCustomers
      ? { customers: options.initialCustomers }
      : undefined,
    revalidateOnFocus: true,
    revalidateOnMount: true,
  });

  const customers: Customer[] = useMemo(() => {
    if (!data) return options.initialCustomers || [];
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.customers)
        ? data.customers
        : options.initialCustomers || [];
  }, [data, options.initialCustomers]);

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
    loading: isLoading,
    isValidating,
    refetch: () => mutate(),
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
