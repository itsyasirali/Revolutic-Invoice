"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthForm from "./useAuthForm";
import type { LoginSignupFormProps } from "@/types/auth";

const useLoginSignupForm = ({
  onLoginSuccess,
  initialMode = "login",
}: LoginSignupFormProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const authForm = useAuthForm({ onLoginSuccess, initialMode });

  const handleToggle = () => {
    authForm.toggleMode();
    if (pathname === "/login") {
      router.push("/register");
    } else if (pathname === "/register" || pathname === "/signup") {
      router.push("/login");
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  return {
    ...authForm,
    showPassword,
    showConfirmPassword,
    handleToggle,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
};

export default useLoginSignupForm;
