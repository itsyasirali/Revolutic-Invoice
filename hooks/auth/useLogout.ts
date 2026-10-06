"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface UseLogoutReturn {
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useLogout = (): UseLogoutReturn => {
  const { logout: doLogout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await doLogout();
      // Straight to the login page (a full navigation also drops all in-memory app state)
      window.location.replace("/login");
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
