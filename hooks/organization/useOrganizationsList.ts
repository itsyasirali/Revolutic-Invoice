"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "@/components/ui";
import { setOrgSwitching } from "@/lib/orgSwitchGuard";
import type { OrganizationData } from "@/types/organization";

export const useOrganizationsList = () => {
  const router = useRouter();
  const {
    organization,
    organizations,
    loading,
    refreshOrganizations,
    switchOrganization,
  } = useOrganization();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<OrganizationData | null>(
    null,
  );

  const handleOpenOrg = useCallback(
    async (org: OrganizationData) => {
      if (!org.slug) return;
      // Switch directly (no confirmation) when opening from the list.
      if (org.id !== organization?.id) {
        setOrgSwitching(true);
        const switched = await switchOrganization(org.id);
        if (!switched) {
          // switchOrganization already shows its own error toast
          setOrgSwitching(false);
          return;
        }
      }
      router.push(`/${org.slug}/dashboard`);
    },
    [router, organization?.id, switchOrganization],
  );

  const handleAddNew = useCallback(() => {
    router.push("/organization-setup?new=true");
  }, [router]);

  const handleEdit = useCallback(
    (org: OrganizationData) => {
      router.push(`/organization-setup?edit=${org.id}`);
    },
    [router],
  );

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
    handleEdit,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
};

export default useOrganizationsList;
