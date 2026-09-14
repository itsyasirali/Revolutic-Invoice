"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginSignupForm from "@/components/auth/auth";

const SignupPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <LoginSignupForm
      initialMode="signup"
      onLoginSuccess={() => router.push("/dashboard")}
    />
  );
};

export default SignupPage;
