"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/axios";
import { validatePassword } from "@/lib/validation/password";

interface UseAuthFormOptions {
  onLoginSuccess?: () => void;
  initialMode?: "login" | "signup";
}

export const useAuthForm = ({
  onLoginSuccess,
  initialMode = "login",
}: UseAuthFormOptions = {}) => {
  const { login, signup, verifySignupOtp } = useAuth();

  const [isSignup, setIsSignup] = useState(initialMode === "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // After submitting the signup form, we pause here awaiting the emailed
  // verification code before the account is actually created.
  const [signupOtpStage, setSignupOtpStage] = useState(false);
  const [signupOtp, setSignupOtp] = useState("");

  React.useEffect(() => {
    setIsSignup(initialMode === "signup");
    setError("");
    setSignupOtpStage(false);
    setSignupOtp("");
  }, [initialMode]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setLoading(false);
    setSignupOtpStage(false);
    setSignupOtp("");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return setError("Please fill in all fields");
    }

    setError("");
    setLoading(true);

    try {
      const success = await login(email.trim(), password);
      if (success) {
        resetForm();
        onLoginSuccess?.();
      } else {
        setError("Invalid credentials. Try again.");
      }
    } catch {
      setError("Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return setError("Please fill in all fields");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return setError(passwordError);
    }

    setError("");
    setLoading(true);

    try {
      const sent = await signup(name.trim(), email.trim(), password);
      if (sent) {
        setSignupOtpStage(true);
      } else {
        setError("Signup failed. Try again.");
      }
    } catch (err: unknown) {
      const serverMessage = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setError(serverMessage || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignupOtp = async () => {
    if (!signupOtp.trim()) {
      return setError("Please enter the verification code");
    }
    setError("");
    setLoading(true);
    try {
      const success = await verifySignupOtp(email.trim(), signupOtp.trim());
      if (success) {
        resetForm();
        onLoginSuccess?.();
      } else {
        setError("Verification failed. Try again.");
      }
    } catch (err: unknown) {
      const serverMessage = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setError(serverMessage || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendSignupOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (err: unknown) {
      const serverMessage = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setError(serverMessage || "Failed to resend code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelSignupOtp = () => {
    setSignupOtpStage(false);
    setSignupOtp("");
    setError("");
  };

  const handleSubmit = async () => {
    if (isSignup) {
      if (signupOtpStage) {
        await handleVerifySignupOtp();
      } else {
        await handleSignup();
      }
    } else {
      await handleLogin();
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return {
    isSignup,
    name,
    email,
    password,
    confirmPassword,
    error,
    loading,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSubmit,
    toggleMode,
    handleKeyPress,
    signupOtpStage,
    signupOtp,
    setSignupOtp,
    handleResendSignupOtp,
    cancelSignupOtp,
  };
};

export default useAuthForm;
