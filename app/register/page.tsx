"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginSignupForm from "@/components/auth/auth";

const RegisterPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.organizationId || user.organization) {
        router.replace("/dashboard");
      } else {
        router.replace("/organization-setup");
      }
    }
  }, [user, loading, router]);

  return (
    <LoginSignupForm
      initialMode="signup"
      onLoginSuccess={() => {
        if (user?.organizationId || user?.organization) {
          router.push("/dashboard");
        } else {
          router.push("/organization-setup");
        }
      }}
    />
  );
};

export default RegisterPage;
