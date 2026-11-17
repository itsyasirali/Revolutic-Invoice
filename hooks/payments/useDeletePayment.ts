"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { toast } from "@/components/ui";
import { invalidatePayments } from "@/lib/swr";
import { useOrgRouter } from "@/hooks/organization/useOrgRouter";

/** Deletes one payment and returns to the payments list. */
export const useDeletePayment = () => {
  const router = useOrgRouter();
  const [deleting, setDeleting] = useState(false);

  /** Returns true when the payment was deleted. */
  const deletePayment = async (paymentId: number | string): Promise<boolean> => {
    setDeleting(true);
    try {
      await axios.delete(`/payments/${paymentId}`);
      await invalidatePayments();
      toast.success("Payment deleted successfully", "Deleted");
      router.push("/payments");
      return true;
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to delete payment", "Error");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleting, deletePayment };
};

export default useDeletePayment;
