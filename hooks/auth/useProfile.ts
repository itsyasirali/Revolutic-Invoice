"use client";

import { useAuth } from "@/context/AuthContext";

export interface User {
  id: string | number;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  companyName?: string | null;
}

export interface UseProfileReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const { user, loading, error, refetchProfile } = useAuth();

  return {
    user: user as User | null,
    loading,
    error,
    refetch: refetchProfile,
  };
};

export default useProfile;
