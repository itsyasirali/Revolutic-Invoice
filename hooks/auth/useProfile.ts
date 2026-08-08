"use client";

import { useSession } from "next-auth/react";

interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  companyName?: string;
}

interface UseProfileReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const { data: session, status, update } = useSession();

  return {
    user: session?.user as User | null,
    loading: status === "loading",
    error: null,
    refetch: update as unknown as () => Promise<void>,
  };
};

export default useProfile;
