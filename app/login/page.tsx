"use client";

import React from "react";
import LoginSignupForm from "@/components/auth/auth";
import useAuthRedirect from "@/hooks/auth/useAuthRedirect";

const LoginPage = () => {
  const { initialMode, handleLoginSuccess } = useAuthRedirect("login");

  return (
    <LoginSignupForm
      initialMode={initialMode}
      onLoginSuccess={handleLoginSuccess}
    />
  );
};

export default LoginPage;
