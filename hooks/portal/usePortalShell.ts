"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { portalSend, usePortalMe } from "@/lib/portalApi";

/** Portal session: redirects to login when signed out and exposes sign-out. */
const usePortalShell = () => {
  const router = useRouter();
  const { me, unauthorized, loading } = usePortalMe();

  useEffect(() => {
    if (unauthorized) router.replace("/portal/login");
  }, [unauthorized, router]);

  const signOut = async () => {
    try {
      await portalSend("POST", "/auth/logout");
    } finally {
      await mutate(() => true, undefined, { revalidate: false });
      router.replace("/portal/login");
    }
  };

  return { me, unauthorized, loading, signOut };
};

export default usePortalShell;
