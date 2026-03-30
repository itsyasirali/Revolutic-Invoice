import { useState } from 'react';
import axios from '../../Service/axios';

interface UpdateInvoicePayload {
  invoiceNumber?: string;
  invoiceLabel?: string;
  invoiceDate?: string;
  dueDate?: string;
  customerId?: string;
  customerDisplayName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items?: Array<{
    itemId?: string;
    title: string;
    description?: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subTotal?: number;
  taxPercent?: number;
  discountPercent?: number;
  shipping?: number;
  total?: number;
  currency?: string;
  notes?: string;
  status?: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

  recipients?: string[];
  templateId?: string;
}

const useUpdateInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateInvoice = async (id: string, data: UpdateInvoicePayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/invoices/${id}`, data);
      setLoading(false);
      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (err: any) {
      setLoading(false);
      const msg = err?.response?.data?.message || 'Failed to update the invoice';
      setError(msg);
      console.error(err);
      return null;
    }
  };

  return { updateInvoice, loading, error };
};

export default useUpdateInvoice;
