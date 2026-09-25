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
  const { login, signup } = useAuth();

  const [isSignup, setIsSignup] = useState(initialMode === "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setIsSignup(initialMode === "signup");
    setError("");
  }, [initialMode]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setLoading(false);
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
      const success = await signup(name.trim(), email.trim(), password);
      if (success) {
        resetForm();
        onLoginSuccess?.();
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

  const handleSubmit = async () => {
    if (isSignup) {
      await handleSignup();
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
  };
};

export default useAuthForm;
