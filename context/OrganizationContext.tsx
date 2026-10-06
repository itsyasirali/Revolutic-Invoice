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
  switchOrganization: (orgId: number) => Promise<OrganizationData | null>;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [initialFetchDone, setInitialFetchDone] = useState<boolean>(false);
  // Which user the organization list was last loaded for. Right after a login the user
  // changes while initialFetchDone is still true from the logged-out state, so without
  // this the app briefly thinks "no organization" and shows the setup form.
  const [fetchedForUserId, setFetchedForUserId] = useState<string | number | null>(null);

  // Restore stored organization from localStorage on client after hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedOrg = localStorage.getItem("active_organization");
        const storedOrgs = localStorage.getItem("user_organizations");
        if (storedOrg) {
          setOrganization(JSON.parse(storedOrg));
        }
        if (storedOrgs) {
          setOrganizations(JSON.parse(storedOrgs));
        }
      } catch {}
    }
  }, []);

  const fetchedUserIdRef = React.useRef<string | number | null>(null);

  const fetchOrganization = useCallback(async (opts?: { silent?: boolean }): Promise<OrganizationData | null> => {
    try {
      if (!opts?.silent) {
        setLoading(true);
      }
      const res = await axios.get("/organizations");
      const org = res.data?.organization ?? null;
      const orgs = res.data?.organizations ?? (org ? [org] : []);

      if (typeof window !== "undefined") {
        try {
          if (org) {
            localStorage.setItem("active_organization", JSON.stringify(org));
          } else {
            localStorage.removeItem("active_organization");
          }
          localStorage.setItem("user_organizations", JSON.stringify(orgs));
        } catch {}
      }

      if (typeof document !== "undefined" && org?.id) {
        document.cookie = `active_org_id=${org.id}; path=/; max-age=2592000; SameSite=Lax`;
        if (org.slug) {
          document.cookie = `active_org_slug=${org.slug}; path=/; max-age=2592000; SameSite=Lax`;
        }
      }
      setOrganization(org);
      setOrganizations(orgs);
      return org;
    } catch {
      setOrganization(null);
      setOrganizations([]);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("active_organization");
          localStorage.removeItem("user_organizations");
        } catch {}
      }
      return null;
    } finally {
      setLoading(false);
      setInitialFetchDone(true);
    }
  }, []);

  const refreshOrganizations = useCallback(async () => {
    await fetchOrganization({ silent: true });
  }, [fetchOrganization]);

  const switchOrganization = useCallback(
    async (orgId: number): Promise<OrganizationData | null> => {
      try {
        setIsSwitching(true);
        const res = await axios.post("/organizations/switch", {
          organizationId: orgId,
        });
        const switchedOrg = res.data?.organization;
        if (switchedOrg) {
          if (typeof document !== "undefined") {
            document.cookie = `active_org_id=${switchedOrg.id}; path=/; max-age=2592000; SameSite=Lax`;
            if (switchedOrg.slug) {
              document.cookie = `active_org_slug=${switchedOrg.slug}; path=/; max-age=2592000; SameSite=Lax`;
            }
          }
          setOrganization(switchedOrg);
          await refetchProfile({ silent: true });
          toast.success(`Switched active organization to ${switchedOrg.name}`, "Organization Switched");
          // Re-fetch organization list to ensure state sync
          await fetchOrganization({ silent: true });
          return switchedOrg;
        }
        return null;
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || "Failed to switch organization";
        toast.error(errorMsg, "Switch Failed");
        return null;
      } finally {
        setIsSwitching(false);
      }
    },
    [refetchProfile, fetchOrganization],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      fetchedUserIdRef.current = null;
      setFetchedForUserId(null);
      setOrganization(null);
      setOrganizations([]);
      setLoading(false);
      setInitialFetchDone(true);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("active_organization");
          localStorage.removeItem("user_organizations");
        } catch {}
      }
      return;
    }

    // Only fetch once per user session
    if (fetchedUserIdRef.current === user.id) return;
    fetchedUserIdRef.current = user.id;

    const forUser = user.id;

    // The login response already carries the user's organization: use it right away so
    // the redirect to the dashboard doesn't wait on the /organizations round trip.
    const seeded = (user as any).organization as OrganizationData | null | undefined;
    if (seeded?.slug) {
      setOrganization((prev) => prev ?? seeded);
      setInitialFetchDone(true);
      setFetchedForUserId(forUser);
    }

    fetchOrganization({ silent: true }).finally(() => setFetchedForUserId(forUser));
  }, [user, authLoading, fetchOrganization]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizations,
        loading:
          (authLoading && !user) ||
          (!!user && !organization && (!initialFetchDone || fetchedForUserId !== user.id)) ||
          loading,
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
