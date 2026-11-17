"use client";

import { useEffect, useMemo } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "@/components/ui";
import { isOrgSwitching, setOrgSwitching } from "@/lib/orgSwitchGuard";

const swapOrgSlug = (pathname: string, slug: string) =>
  pathname.replace(/^\/[^/]+/, `/${slug}`);

/** Keeps the /{orgSlug} URL in sync with the user's active organization. */
export const useOrgSlugGuard = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    organization,
    organizations,
    loading: orgLoading,
    switchOrganization,
  } = useOrganization();

  const loading = authLoading || orgLoading;
  const isMatch = !!organization && organization.slug === orgSlug;
  // The switcher already confirmed this change; hold off the layout's own
  // dialog until the URL has caught up with the new active organization.
  const switchInProgress = isOrgSwitching() && !isMatch;
  const matchedOrg = useMemo(
    () =>
      isMatch || switchInProgress
        ? null
        : organizations.find((o) => o.slug === orgSlug) || null,
    [isMatch, switchInProgress, organizations, orgSlug],
  );

  useEffect(() => {
    if (isMatch && isOrgSwitching()) setOrgSwitching(false);
  }, [isMatch]);

  const handleCancelSwitch = () => {
    if (organization?.slug) {
      router.replace(swapOrgSlug(pathname, organization.slug));
    }
  };

  const handleConfirmSwitch = async () => {
    if (matchedOrg) {
      await switchOrganization(matchedOrg.id);
    }
  };

  // orgSlug doesn't belong to this user at all - nothing to confirm, just bounce back
  useEffect(() => {
    if (loading || !user || isMatch || matchedOrg || switchInProgress) return;
    if (organization?.slug) {
      toast.error("Organization not found", "Invalid Organization");
      router.replace(swapOrgSlug(pathname, organization.slug));
    } else if (!organizations.length) {
      router.replace("/organization-setup");
    }
  }, [
    loading,
    user,
    isMatch,
    matchedOrg,
    switchInProgress,
    organization?.slug,
    organizations.length,
    pathname,
    router,
  ]);

  return { matchedOrg, handleCancelSwitch, handleConfirmSwitch };
};

export default useOrgSlugGuard;
