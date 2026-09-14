"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/context/OrganizationContext";
import type { UseOrganizationSwitcherReturn } from "@/types/organization";

const useOrganizationSwitcher = (): UseOrganizationSwitcherReturn => {
  const router = useRouter();
  const {
    organization,
    organizations,
    loading,
    isSwitching,
    switchOrganization,
  } = useOrganization();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectOrg = useCallback(
    async (orgId: number) => {
      if (orgId === organization?.id || isSwitching) {
        setIsOpen(false);
        return;
      }
      await switchOrganization(orgId);
      setIsOpen(false);
    },
    [organization?.id, isSwitching, switchOrganization],
  );

  const handleAddNewOrg = useCallback(() => {
    setIsOpen(false);
    router.push("/organization-setup?new=true");
  }, [router]);

  return {
    organization,
    organizations,
    loading,
    isSwitching,
    isOpen,
    dropdownRef,
    setIsOpen,
    handleSelectOrg,
    handleAddNewOrg,
  };
};

export default useOrganizationSwitcher;
