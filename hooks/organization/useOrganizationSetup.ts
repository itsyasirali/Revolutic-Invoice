"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "@/components/ui";
import {
  INDUSTRIES,
  LOCATIONS,
  PROVINCES,
  LANGUAGES,
  TIMEZONES,
} from "@/data/organizationSetupData";
import type { UseOrganizationSetupReturn } from "@/types/organization";

export const useOrganizationSetup = (): UseOrganizationSetupReturn => {
  const router = useRouter();
  const { user, refetchProfile, logout } = useAuth();
  const { hasOrganization, refreshOrganizations, setOrganization } =
    useOrganization();

  const isAddingNewOrg = hasOrganization;

  // Form State
  const [organizationName, setOrganizationName] = useState(
    isAddingNewOrg ? "" : user?.companyName || "",
  );
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [province, setProvince] = useState(PROVINCES[0]);
  const [currency, setCurrency] = useState("PKR");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [timeZone, setTimeZone] = useState(TIMEZONES[0]);

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

        router.push("/dashboard");
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
      setOrganization,
      refreshOrganizations,
      refetchProfile,
      router,
    ],
  );

  const handleBack = useCallback(() => {
    if (isAddingNewOrg) {
      router.push("/dashboard");
    } else {
      logout();
    }
  }, [isAddingNewOrg, router, logout]);

  return {
    organizationName,
    setOrganizationName,
    industry,
    setIndustry,
    location,
    setLocation,
    province,
    setProvince,
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
    handleSubmit,
    handleBack,
  };
};

export default useOrganizationSetup;
