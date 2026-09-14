"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

export interface OrganizationData {
  id: number;
  name: string;
  industry?: string | null;
  businessLocation?: string | null;
  stateProvince?: string | null;
  currency?: string | null;
  language?: string | null;
  timeZone?: string | null;
  fiscalYear?: string | null;
  isDefault?: boolean;
}

interface OrganizationContextType {
  organization: OrganizationData | null;
  loading: boolean;
  hasOrganization: boolean;
  fetchOrganization: () => Promise<OrganizationData | null>;
  setOrganization: React.Dispatch<React.SetStateAction<OrganizationData | null>>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuth();
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrganization = useCallback(async (): Promise<OrganizationData | null> => {
    try {
      setLoading(true);
      const res = await axios.get("/organizations");
      const org = res.data?.organization ?? null;
      setOrganization(org);
      return org;
    } catch {
      setOrganization(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    // If user already has org data populated from /auth/me
    if (user.organization) {
      setOrganization(user.organization as unknown as OrganizationData);
      setLoading(false);
      return;
    }

    fetchOrganization();
  }, [user, authLoading, fetchOrganization]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        loading: authLoading || loading,
        hasOrganization: !!organization,
        fetchOrganization,
        setOrganization,
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
