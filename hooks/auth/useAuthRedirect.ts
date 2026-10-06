"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";

const useAuthRedirect = (initialMode: "login" | "signup") => {
  const { user, loading } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    // Wait until the organization list has actually been fetched for this user;
    // otherwise a fresh login looks like "no organization" and shows the setup form.
    if (loading || orgLoading || !user) return;

    if (organization?.slug) {
      router.replace(`/${organization.slug}/dashboard`);
    } else {
      router.replace("/organization-setup");
    }
  }, [user, loading, orgLoading, organization?.slug, router]);

  // Redirect is handled by the effect above once auth + organization have resolved
  // (the values captured here would be stale right after login).
  const handleLoginSuccess = () => {};

  return {
    initialMode,
    handleLoginSuccess,
  };
};

export default useAuthRedirect;
