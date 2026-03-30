'use client';
import { useState, useCallback } from 'react';
import axios from '../../Service/axios';
import type { CreateInvoiceInput, CreateInvoiceResponse } from '../../types/invoice';

export type CreateInvoicePayload = CreateInvoiceInput;

type CreateResp = CreateInvoiceResponse;

const useCreateInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<CreateResp | null>(null);

  const request = useCallback(async (payload: CreateInvoicePayload, sendNow: boolean) => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post<CreateResp>(`/invoices`, { ...payload, sendNow });
      setLast(res.data);
      return res.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create invoice';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []); // Include router in dependency array

  const saveDraft = useCallback(
    async (payload: CreateInvoicePayload) => request(payload, false),
    [request]
  );

  const saveAndSend = useCallback(
    async (payload: CreateInvoicePayload) => request(payload, true),
    [request]
  );

  return { saveDraft, saveAndSend, loading, error, last };
};

export default useCreateInvoice;
