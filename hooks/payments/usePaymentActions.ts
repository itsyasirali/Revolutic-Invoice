"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import type { UsePaymentActionsReturn } from "@/types/payment";
import { setNavState } from "@/lib/clientNavState";

const usePaymentActions = (): UsePaymentActionsReturn => {
  const router = useRouter();

  const handleNew = useCallback(() => {
    router.push("/payments/new");
  }, [router]);

  const handleRowClick = useCallback(
    (id: string, data?: any) => {
      if (data) {
        setNavState(`payment:${id}`, data);
      }
      router.push(`/payments/${id}`);
    },
    [router]
  );

  const handlePreview = useCallback(
    (id: string, data?: any) => {
      if (data) {
        setNavState(`payment:${id}`, data);
      }
      router.push(`/payments/preview/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string, data?: any) => {
      if (data) {
        setNavState(`payment:${id}`, data);
      }
      router.push(`/payments/edit/${id}`);
    },
    [router]
  );

  const handleBackToList = useCallback(() => {
    router.push("/payments");
  }, [router]);

  const handleBackToEdit = useCallback(
    (id: string) => {
      router.push(`/payments/edit/${id}`);
    },
    [router]
  );

  const updateTemplate = useCallback(
    async (id: string, templateId: string) => {
      await axios.put(`/payments/${id}`, { templateId });
    },
    []
  );

  return {
    handleNew,
    handleRowClick,
    handlePreview,
    handleEdit,
    handleBackToList,
    handleBackToEdit,
    updateTemplate,
  };
};

export default usePaymentActions;
