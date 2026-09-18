"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "@/components/ui";
import type { OrganizationData } from "@/types/organization";

export const useOrganizationsList = () => {
  const router = useRouter();
  const { organization, organizations, loading, refreshOrganizations } =
    useOrganization();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<OrganizationData | null>(
    null,
  );

  const handleOpenOrg = useCallback(
    (org: OrganizationData) => {
      if (org.slug) {
        router.push(`/${org.slug}/dashboard`);
      }
    },
    [router],
  );

  const handleAddNew = useCallback(() => {
    router.push("/organization-setup?new=true");
  }, [router]);

  const requestDelete = useCallback((org: OrganizationData) => {
    setPendingDelete(org);
  }, []);

  const cancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;

    setDeleteLoading(true);
    try {
      await axios.delete(`/organizations/${pendingDelete.id}`);
      toast.error(`"${pendingDelete.name}" deleted successfully`, "Deleted");
      await refreshOrganizations();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to delete organization";
      toast.error(msg, "Delete Failed");
    } finally {
      setDeleteLoading(false);
      setPendingDelete(null);
    }
  }, [pendingDelete, refreshOrganizations]);

  return {
    organization,
    organizations,
    loading,
    deleteLoading,
    pendingDelete,
    handleOpenOrg,
    handleAddNew,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
};

export default useOrganizationsList;
