"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";

export interface User {
  id: string | number;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  companyName?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refetchProfile: (opts?: { silent?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      setError(null);

      const response = await axios.get("/auth/me");
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err: unknown) {
      setUser(null);
      if (axios.isAxiosError(err) && err.response?.status !== 401) {
        setError(err.response?.data?.message || "Failed to load session");
      }
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/auth/login", { email, password });
      if (response.data?.user) {
        setUser(response.data.user);
        if (response.data?.token) {
          try {
            localStorage.setItem("auth_token", response.data.token);
          } catch {
            // Ignore localStorage errors in private mode
          }
        }
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Invalid email or password"
        : "Login failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/auth/signup", { name, email, password });
      if (response.data?.user) {
        setUser(response.data.user);
        if (response.data?.token) {
          try {
            localStorage.setItem("auth_token", response.data.token);
          } catch {
            // Ignore localStorage errors
          }
        }
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Signup failed"
        : "Signup failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // Ignore
      }
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        refetchProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
