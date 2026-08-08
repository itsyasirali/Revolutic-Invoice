"use client";

import { useState } from "react";
import axios from "@/lib/axios";

interface UseLogoutReturn {
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useLogout = (): UseLogoutReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(`/auth/logout`, {});
    } catch (err: unknown) {
      console.error("Logout failed:", err);
      setError(axios.isAxiosError(err) ? err.response?.data?.message || "Logout failed" : "Logout failed");
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setLoading(false);
      window.location.href = "/login";
    }
  };

  return {
    logout,
    loading,
    error,
  };
};

export default useLogout;
