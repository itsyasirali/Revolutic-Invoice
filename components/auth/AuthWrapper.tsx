"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginSignupForm from "./auth";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthContent: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();

  const [showLoader, setShowLoader] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const hasLoaded = sessionStorage.getItem("app_has_loaded");
      if (!hasLoaded) {
        setShowLoader(true);
        sessionStorage.setItem("app_has_loaded", "true");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    if (mounted && showLoader) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="grid grid-cols-2 gap-2 animate-spin">
            <div className="w-3 h-3 rounded-full bg-primary/80"></div>
            <div className="w-3 h-3 rounded-full bg-primary/60"></div>
            <div className="w-3 h-3 rounded-full bg-primary/100"></div>
            <div className="w-3 h-3 rounded-full bg-primary/40"></div>
          </div>
        </div>
      );
    }
    return null;
  }

  if (!user) {
    return <LoginSignupForm onLoginSuccess={() => window.location.reload()} />;
  }

  return <>{children}</>;
};

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AuthContent>{children}</AuthContent>
    </AuthProvider>
  );
};

export default AuthWrapper;
