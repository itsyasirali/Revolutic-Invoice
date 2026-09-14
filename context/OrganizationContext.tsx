"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

import { OrganizationData } from "@/types/organization";
import { toast } from "@/components/ui";

export type { OrganizationData };

interface OrganizationContextType {
  organization: OrganizationData | null;
  organizations: OrganizationData[];
  loading: boolean;
  isSwitching: boolean;
  hasOrganization: boolean;
  fetchOrganization: () => Promise<OrganizationData | null>;
  switchOrganization: (orgId: number) => Promise<boolean>;
  refreshOrganizations: () => Promise<void>;
  setOrganization: React.Dispatch<React.SetStateAction<OrganizationData | null>>;
  setOrganizations: React.Dispatch<React.SetStateAction<OrganizationData[]>>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading, refetchProfile } = useAuth();
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  const fetchOrganization = useCallback(async (): Promise<OrganizationData | null> => {
    try {
      setLoading(true);
      const res = await axios.get("/organizations");
      const org = res.data?.organization ?? null;
      const orgs = res.data?.organizations ?? (org ? [org] : []);
      setOrganization(org);
      setOrganizations(orgs);
      return org;
    } catch {
      setOrganization(null);
      setOrganizations([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrganizations = useCallback(async () => {
    await fetchOrganization();
  }, [fetchOrganization]);

  const switchOrganization = useCallback(
    async (orgId: number): Promise<boolean> => {
      try {
        setIsSwitching(true);
        const res = await axios.post("/organizations/switch", {
          organizationId: orgId,
        });
        const switchedOrg = res.data?.organization;
        if (switchedOrg) {
          setOrganization(switchedOrg);
          await refetchProfile({ silent: true });
          toast.success(`Switched active organization to ${switchedOrg.name}`, "Organization Switched");
          // Re-fetch organization list to ensure state sync
          await fetchOrganization();
          // Reload page data so all dashboard/data components reload for new organization
          window.location.reload();
          return true;
        }
        return false;
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || "Failed to switch organization";
        toast.error(errorMsg, "Switch Failed");
        return false;
      } finally {
        setIsSwitching(false);
      }
    },
    [refetchProfile, fetchOrganization],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setOrganization(null);
      setOrganizations([]);
      setLoading(false);
      return;
    }

    fetchOrganization();
  }, [user, authLoading, fetchOrganization]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizations,
        loading: authLoading || loading,
        isSwitching,
        hasOrganization: !!organization,
        fetchOrganization,
        switchOrganization,
        refreshOrganizations,
        setOrganization,
        setOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
};

export default OrganizationContext;
