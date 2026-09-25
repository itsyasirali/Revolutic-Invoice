"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

interface UseOtpAuthOptions {
  onLoginSuccess?: () => void;
}

export const useOtpAuth = ({ onLoginSuccess }: UseOtpAuthOptions = {}) => {
  const { refetchProfile } = useAuth();

  const [otpMode, setOtpMode] = useState(false);
  const [otpStage, setOtpStage] = useState<"email" | "code">("email");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const resetOtp = () => {
    setOtpStage("email");
    setOtpEmail("");
    setOtpCode("");
    setOtpError("");
    setOtpLoading(false);
  };

  const enterOtpMode = () => {
    resetOtp();
    setOtpMode(true);
  };

  const exitOtpMode = () => {
    resetOtp();
    setOtpMode(false);
  };

  const requestOtp = async () => {
    if (!otpEmail.trim()) {
      setOtpError("Please enter your email address");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      await axios.post("/auth/otp/request", { email: otpEmail.trim() });
      setOtpStage("code");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setOtpError(message || "Failed to send verification code. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode.trim()) {
      setOtpError("Please enter the verification code");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      const response = await axios.post("/auth/otp/verify", {
        email: otpEmail.trim(),
        otp: otpCode.trim(),
      });
      if (response.data?.token) {
        try {
          localStorage.setItem("auth_token", response.data.token);
        } catch {
          // Ignore localStorage errors in private mode
        }
      }
      await refetchProfile({ silent: true });
      resetOtp();
      setOtpMode(false);
      onLoginSuccess?.();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setOtpError(message || "Invalid or expired verification code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (otpStage === "email") {
      requestOtp();
    } else {
      verifyOtp();
    }
  };

  return {
    otpMode,
    otpStage,
    otpEmail,
    setOtpEmail,
    otpCode,
    setOtpCode,
    otpLoading,
    otpError,
    enterOtpMode,
    exitOtpMode,
    requestOtp,
    verifyOtp,
    handleOtpKeyPress,
  };
};

export default useOtpAuth;
