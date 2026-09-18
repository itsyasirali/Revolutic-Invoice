"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOrganization } from "@/context/OrganizationContext";
import type { OrganizationData, UseOrganizationSwitcherReturn } from "@/types/organization";

const useOrganizationSwitcher = (): UseOrganizationSwitcherReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    organization,
    organizations,
    loading,
    isSwitching,
    switchOrganization,
  } = useOrganization();

  const [isOpen, setIsOpen] = useState(false);
  const [pendingOrg, setPendingOrg] = useState<OrganizationData | null>(null);
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
    (orgId: number) => {
      if (orgId === organization?.id || isSwitching) {
        setIsOpen(false);
        return;
      }
      const target = organizations.find((o) => o.id === orgId) || null;
      setIsOpen(false);
      setPendingOrg(target);
    },
    [organization?.id, isSwitching, organizations],
  );

  const confirmSwitch = useCallback(async () => {
    if (!pendingOrg) return;
    const switchedOrg = await switchOrganization(pendingOrg.id);
    setPendingOrg(null);
    if (switchedOrg?.slug) {
      const rest = pathname.replace(/^\/[^/]+/, "") || "/dashboard";
      router.push(`/${switchedOrg.slug}${rest}`);
    }
  }, [pendingOrg, switchOrganization, pathname, router]);

  const cancelSwitch = useCallback(() => {
    setPendingOrg(null);
  }, []);

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
    pendingOrg,
    confirmSwitch,
    cancelSwitch,
  };
};

export default useOrganizationSwitcher;
