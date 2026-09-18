"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrganization } from "@/context/OrganizationContext";
import { buildOrgPath } from "@/lib/orgPath";

type NavigateOptions = Parameters<ReturnType<typeof useRouter>["push"]>[1];

/**
 * Drop-in replacement for next/navigation's useRouter() that prefixes
 * in-app path literals ("/customers", `/invoices/${id}`, ...) with the
 * current organization slug. The URL param wins over context so navigation
 * from an unconfirmed org-mismatch page stays inside the URL's own org
 * until the user actually confirms the switch.
 */
export const useOrgRouter = () => {
  const router = useRouter();
  const params = useParams<{ orgSlug?: string }>();
  const { organization } = useOrganization();
  const slug = params?.orgSlug || organization?.slug || null;

  return useMemo(
    () => ({
      push: (href: string, options?: NavigateOptions) =>
        router.push(buildOrgPath(slug, href), options),
      replace: (href: string, options?: NavigateOptions) =>
        router.replace(buildOrgPath(slug, href), options),
      back: () => router.back(),
      forward: () => router.forward(),
      refresh: () => router.refresh(),
    }),
    [router, slug],
  );
};

export default useOrgRouter;
