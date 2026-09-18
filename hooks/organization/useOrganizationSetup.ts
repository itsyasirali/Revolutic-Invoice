"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "@/components/ui";
import {
  INDUSTRIES,
  LOCATIONS,
  LANGUAGES,
  getStatesForCountry,
  getTimezoneForCountry,
  getCurrencyForCountry,
} from "@/data/organizationSetupData";
import { MAX_ORGANIZATIONS_PER_USER } from "@/types/organization";
import type { UseOrganizationSetupReturn } from "@/types/organization";

export const useOrganizationSetup = (): UseOrganizationSetupReturn => {
  const router = useRouter();
  const { user, refetchProfile, logout } = useAuth();
  const {
    organization,
    organizations,
    hasOrganization,
    refreshOrganizations,
    setOrganization,
  } = useOrganization();

  const isAddingNewOrg = hasOrganization;
  const limitReached = isAddingNewOrg && organizations.length >= MAX_ORGANIZATIONS_PER_USER;

  useEffect(() => {
    if (limitReached) {
      toast.error(
        `You can create up to ${MAX_ORGANIZATIONS_PER_USER} organizations. Delete an existing organization first.`,
        "Limit Reached",
      );
      router.replace(organization?.slug ? `/${organization.slug}/dashboard` : "/organizations");
    }
  }, [limitReached, organization?.slug, router]);

  // Form State
  const [organizationName, setOrganizationName] = useState(
    isAddingNewOrg ? "" : user?.companyName || "",
  );
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [provincesList, setProvincesList] = useState<string[]>(() =>
    getStatesForCountry(LOCATIONS[0]),
  );
  const [province, setProvince] = useState(() => {
    const states = getStatesForCountry(LOCATIONS[0]);
    return states[0] || "";
  });
  const [currency, setCurrency] = useState(() =>
    getCurrencyForCountry(LOCATIONS[0]),
  );
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [timeZone, setTimeZone] = useState(() =>
    getTimezoneForCountry(LOCATIONS[0]),
  );

  // When location changes, auto-select country's currency, state/province, and timezone
  const handleLocationChange = useCallback((newLocation: string) => {
    setLocation(newLocation);

    // 1. Auto-select Currency
    const autoCurrency = getCurrencyForCountry(newLocation);
    if (autoCurrency) {
      setCurrency(autoCurrency);
    }

    // 2. Auto-select State / Province
    const newStates = getStatesForCountry(newLocation);
    setProvincesList(newStates);
    setProvince(newStates[0] || "");

    // 3. Auto-select Time Zone
    const autoTimezone = getTimezoneForCountry(newLocation);
    if (autoTimezone) {
      setTimeZone(autoTimezone);
    }
  }, []);

  // Optional Address toggle & fields
  const [showAddress, setShowAddress] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userName = user?.firstName || user?.name?.split(" ")[0] || "there";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (limitReached) {
        setError(
          `You can create up to ${MAX_ORGANIZATIONS_PER_USER} organizations. Delete an existing organization first.`,
        );
        return;
      }

      if (!organizationName.trim()) {
        setError("Organization Name is required");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fullAddress = showAddress
          ? [
              streetAddress,
              city,
              province !== "State/Province" ? province : "",
              location,
              zipCode,
            ]
              .filter(Boolean)
              .join(", ")
          : location;

        const response = await axios.post("/organizations", {
          name: organizationName.trim(),
          industry,
          currency,
          address: fullAddress || undefined,
          businessLocation: location,
          stateProvince: province !== "State/Province" ? province : undefined,
          language,
          timeZone,
        });

        const savedOrg = response.data?.organization;
        if (savedOrg) {
          setOrganization(savedOrg);
        }

        await refreshOrganizations();
        await refetchProfile({ silent: true });

        toast.success(
          isAddingNewOrg
            ? `Organization "${organizationName}" has been created.`
            : `${organizationName} has been initialized successfully.`,
          isAddingNewOrg ? "Organization Created" : "Setup Complete",
        );

        router.push(savedOrg?.slug ? `/${savedOrg.slug}/dashboard` : "/organization-setup");
        router.refresh();
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || "Failed to set up organization.",
          );
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [
      organizationName,
      showAddress,
      streetAddress,
      city,
      province,
      location,
      zipCode,
      industry,
      currency,
      language,
      timeZone,
      isAddingNewOrg,
      limitReached,
      setOrganization,
      refreshOrganizations,
      refetchProfile,
      router,
    ],
  );

  const handleBack = useCallback(() => {
    if (isAddingNewOrg) {
      router.push(organization?.slug ? `/${organization.slug}/dashboard` : "/organization-setup");
    } else {
      logout();
    }
  }, [isAddingNewOrg, organization?.slug, router, logout]);

  return {
    organizationName,
    setOrganizationName,
    industry,
    setIndustry,
    location,
    setLocation,
    handleLocationChange,
    province,
    setProvince,
    provincesList,
    currency,
    setCurrency,
    language,
    setLanguage,
    timeZone,
    setTimeZone,
    showAddress,
    setShowAddress,
    streetAddress,
    setStreetAddress,
    city,
    setCity,
    zipCode,
    setZipCode,
    loading,
    error,
    userName,
    isAddingNewOrg,
    limitReached,
    handleSubmit,
    handleBack,
  };
};

export default useOrganizationSetup;
