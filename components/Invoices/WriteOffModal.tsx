"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Ban, X } from "lucide-react";
import { Button, Input, Textarea } from "@/components/ui";

type WriteOffModalProps = {
  isOpen: boolean;
  invoiceLabel: string;
  remainingAmount: number;
  currency?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (amount: number, reason: string) => void;
};

export const WriteOffModal: React.FC<WriteOffModalProps> = ({
  isOpen,
  invoiceLabel,
  remainingAmount,
  currency = "",
  loading = false,
  onCancel,
  onConfirm,
}) => {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState(String(remainingAmount));
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setAmount(String(remainingAmount));
      setReason("");
      setError("");
    }
  }, [isOpen, remainingAmount]);

  if (!isOpen || !mounted) return null;

  const handleConfirm = () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }
    if (numericAmount > remainingAmount) {
      setError(`Amount cannot exceed the remaining balance (${remainingAmount})`);
      return;
    }
    if (!reason.trim()) {
      setError("A reason is required to write off this invoice");
      return;
    }
    onConfirm(numericAmount, reason.trim());
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative bg-white rounded-b-xl shadow-2xl border-x border-b border-slate-200 max-w-md w-full z-10 overflow-hidden mt-0">
        <div className="flex items-start gap-4 p-6">
          <div className="p-2.5 rounded-md bg-rose-50 shadow-sm shrink-0 text-rose-600">
            <Ban className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900">
              Write Off Invoice
            </h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Mark {invoiceLabel} as uncollectible bad debt. This removes it
              from receivables and cannot be undone from here without a
              reversal.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-2 flex flex-col gap-4">
          <Input
            label="Amount to Write Off"
            required
            type="number"
            min={0}
            max={remainingAmount}
            step="0.01"
            prefix={currency}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            helperText={`Remaining balance: ${currency} ${remainingAmount}`}
          />
          <Textarea
            label="Reason"
            required
            rows={3}
            placeholder="e.g. Customer unresponsive, deemed uncollectible"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && (
            <p className="text-xs text-red-500 font-medium -mt-2">{error}</p>
          )}
        </div>

        <div className="flex gap-2.5 justify-end px-6 py-4">
          <Button onClick={onCancel} variant="outline" size="sm" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="danger" size="sm" loading={loading}>
            Write Off
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default WriteOffModal;
