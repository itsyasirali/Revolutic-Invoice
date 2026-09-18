"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";

const useAuthRedirect = (initialMode: "login" | "signup") => {
  const { user, loading } = useAuth();
  const { organization } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (organization?.slug) {
        router.replace(`/${organization.slug}/dashboard`);
      } else if (user.organizationId || user.organization) {
        // Org exists but hasn't been resolved by OrganizationContext yet; wait for it.
      } else {
        router.replace("/organization-setup");
      }
    }
  }, [user, loading, organization?.slug, router]);

  const handleLoginSuccess = () => {
    if (organization?.slug) {
      router.push(`/${organization.slug}/dashboard`);
    } else if (user?.organizationId || user?.organization) {
      // Org exists but hasn't been resolved by OrganizationContext yet; wait for it.
    } else {
      router.push("/organization-setup");
    }
  };

  return {
    initialMode,
    handleLoginSuccess,
  };
};

export default useAuthRedirect;
