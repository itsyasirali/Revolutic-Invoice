"use client";

import { useEffect, useState } from "react";

/** Form state and validation for writing off an invoice's remaining balance. */
const useWriteOffForm = (
  isOpen: boolean,
  remainingAmount: number,
  onConfirm: (amount: number, reason: string) => void,
) => {
  const [amount, setAmount] = useState(String(remainingAmount));
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount(String(remainingAmount));
      setReason("");
      setError("");
    }
  }, [isOpen, remainingAmount]);

  const handleConfirm = () => {
    const numericAmount = Number(Number(amount).toFixed(2));
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }
    if (numericAmount - remainingAmount > 0.005) {
      setError(`Amount cannot exceed the remaining balance (${remainingAmount})`);
      return;
    }
    if (!reason.trim()) {
      setError("A reason is required to write off this invoice");
      return;
    }
    setError("");
    onConfirm(numericAmount, reason.trim());
  };

  return { amount, setAmount, reason, setReason, error, handleConfirm };
};

export default useWriteOffForm;
