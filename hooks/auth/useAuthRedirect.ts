"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const useAuthRedirect = (initialMode: "login" | "signup") => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.organizationId || user.organization) {
        router.replace("/dashboard");
      } else {
        router.replace("/organization-setup");
      }
    }
  }, [user, loading, router]);

  const handleLoginSuccess = () => {
    if (user?.organizationId || user?.organization) {
      router.push("/dashboard");
    } else {
      router.push("/organization-setup");
    }
  };

  return {
    initialMode,
    handleLoginSuccess,
  };
};

export default useAuthRedirect;
