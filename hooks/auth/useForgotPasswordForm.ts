"use client";

import { useState } from "react";
import axios from "@/lib/axios";

export const useForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setError(message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    error,
    submitted,
    handleSubmit,
  };
};

export default useForgotPasswordForm;
