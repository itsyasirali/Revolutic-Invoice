"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

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
      localStorage.clear();
      sessionStorage.clear();
      await signOut({ callbackUrl: "/login" });
    } catch (err: unknown) {
      console.error("Logout failed:", err);
      setError("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    logout,
    loading,
    error,
  };
};

export default useLogout;
