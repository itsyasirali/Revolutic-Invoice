"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth, type User } from "@/context/AuthContext";
import LoginSignupForm from "./auth";

interface AuthWrapperProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

const AuthContent = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/demo") ||
    pathname.startsWith("/billing");

  // Public marketing pages are always accessible
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If user is authenticated, render immediately with ZERO delay
  if (user) {
    return <>{children}</>;
  }

  // If unauthenticated and not loading on protected routes, render login form immediately
  if (!loading && !user) {
    return <LoginSignupForm onLoginSuccess={() => window.location.reload()} />;
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
