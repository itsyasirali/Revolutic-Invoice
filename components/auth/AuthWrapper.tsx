"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth, type User } from "@/context/AuthContext";
import LoginSignupForm from "./auth";

interface AuthWrapperProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

const AuthContent = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
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
    if (!loading && !user && !isPublicRoute) {
      router.replace("/login");
    }
  }, [loading, user, isPublicRoute, router]);

  // Public marketing and auth pages are always accessible
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If user is authenticated, render immediately with ZERO delay
  if (user) {
    return <>{children}</>;
  }

  // If unauthenticated and not loading on protected routes, redirect to /login
  if (!loading && !user) {
    return null;
  }

  // During any brief client session check (when initialUser was not passed),
  // render the layout shell immediately rather than a blank screen
  return <>{children}</>;
};

export const AuthWrapper = ({ children, initialUser }: AuthWrapperProps) => {
  return (
    <AuthProvider initialUser={initialUser}>
      <AuthContent>{children}</AuthContent>
    </AuthProvider>
  );
};

export default AuthWrapper;
