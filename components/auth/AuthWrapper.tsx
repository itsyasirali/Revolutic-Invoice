"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { OrganizationProvider, useOrganization } from "@/context/OrganizationContext";
import type { AuthWrapperProps } from "@/types/auth";

const AuthContent = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { organization, hasOrganization, loading: orgLoading } = useOrganization();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/industries") ||
    pathname.startsWith("/resources") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/customers-stories");

  React.useEffect(() => {
    if (!authLoading && !user && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    // If authenticated on a protected route and has no org yet
    if (
      !authLoading &&
      !orgLoading &&
      user &&
      !hasOrganization &&
      pathname !== "/organization-setup" &&
      !isPublicRoute
    ) {
      router.replace("/organization-setup");
      return;
    }

    // If already has org and tries to visit organization-setup without ?new=true
    const isCreatingNewOrg =
      typeof window !== "undefined" &&
      (window.location.search.includes("new=true") ||
        window.location.search.includes("create=true"));

    if (
      !authLoading &&
      !orgLoading &&
      user &&
      hasOrganization &&
      pathname === "/organization-setup" &&
      !isCreatingNewOrg &&
      organization?.slug
    ) {
      router.replace(`/${organization.slug}/dashboard`);
    }
  }, [authLoading, orgLoading, user, hasOrganization, organization?.slug, isPublicRoute, pathname, router]);

  // Public marketing and auth pages are always accessible
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If unauthenticated and not loading on protected routes, redirect to /login
  if (!authLoading && !user) {
    return null;
  }

  // If user is authenticated, render
  if (user) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export const AuthWrapper = ({ children, initialUser }: AuthWrapperProps) => {
  return (
    <AuthProvider initialUser={initialUser}>
      <OrganizationProvider>
        <AuthContent>{children}</AuthContent>
      </OrganizationProvider>
    </AuthProvider>
  );
};

export default AuthWrapper;
