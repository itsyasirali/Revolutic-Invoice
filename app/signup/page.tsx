"use client";

import React from "react";
import LoginSignupForm from "@/components/auth/auth";
import useAuthRedirect from "@/hooks/auth/useAuthRedirect";

const SignupPage = () => {
  const { initialMode, handleLoginSuccess } = useAuthRedirect("signup");

  return (
    <LoginSignupForm
      initialMode={initialMode}
      onLoginSuccess={handleLoginSuccess}
    />
  );
};

export default SignupPage;
