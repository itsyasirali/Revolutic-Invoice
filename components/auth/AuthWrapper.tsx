"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth, type User } from "@/context/AuthContext";
import { OrganizationProvider, useOrganization } from "@/context/OrganizationContext";

interface AuthWrapperProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

const AuthContent = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { hasOrganization, loading: orgLoading } = useOrganization();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/signup") ||
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

    // If already has org and tries to visit organization-setup
    if (
      !authLoading &&
      !orgLoading &&
      user &&
      hasOrganization &&
      pathname === "/organization-setup"
    ) {
      router.replace("/dashboard");
    }
  }, [authLoading, orgLoading, user, hasOrganization, isPublicRoute, pathname, router]);

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
