"use client";

import React from "react";
import { useSession, SessionProvider } from "next-auth/react";
import LoginSignupForm from "./auth";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthContent: React.FC<AuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-md h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return <LoginSignupForm onLoginSuccess={() => window.location.reload()} />;
  }

  return <>{children}</>;
};

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <SessionProvider>
      <AuthContent>{children}</AuthContent>
    </SessionProvider>
  );
};

export default AuthWrapper;
