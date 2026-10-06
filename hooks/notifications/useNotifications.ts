"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { FileText, DollarSign } from "lucide-react";
import { swrFetcher, SWR_KEYS } from "@/lib/swr";
import { useOrganization } from "@/context/OrganizationContext";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: number;
  icon: typeof FileText;
  href: string;
  unread: boolean;
}

export const NOTIFICATION_LIMIT = 15;

export const formatTimeAgo = (time: number) => {
  const mins = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : new Date(time).toLocaleDateString();
};

const storageKey = (orgId?: number | string) => `notifications_last_seen_${orgId ?? "default"}`;

const readLastSeen = (key: string): number | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
};

const writeLastSeen = (key: string, value: number) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // storage unavailable (private mode): badge simply won't persist
  }
};

/**
 * Recent invoice/payment activity as notifications. Reads the same SWR lists the
 * invoice and payment screens use, so it adds no requests when those are cached and
 * refreshes automatically when they are invalidated. "Unread" means newer than the
 * last time the drawer was opened (kept per organization in localStorage).
 */
const useNotifications = () => {
  const { organization } = useOrganization();
  const key = storageKey(organization?.id);

  const { data: invData, isLoading: invLoading } = useSWR<any>(SWR_KEYS.invoices, swrFetcher, {
    revalidateOnFocus: false,
  });
  const { data: payData, isLoading: payLoading } = useSWR<any>(SWR_KEYS.payments, swrFetcher, {
    revalidateOnFocus: false,
  });

  const [lastSeen, setLastSeen] = useState<number | null>(null);
  // Boundary used to highlight unread rows while the drawer is open, so the badge can
  // clear immediately without the highlights disappearing.
  const [highlightAfter, setHighlightAfter] = useState<number | null>(null);

  useEffect(() => {
    const stored = readLastSeen(key);
    if (stored) {
      setLastSeen(stored);
    } else {
      // First visit: start from now so existing history isn't shown as unread.
      const now = Date.now();
      writeLastSeen(key, now);
      setLastSeen(now);
    }
    setHighlightAfter(null);
  }, [key]);

  const all = useMemo(() => {
    const invoices: any[] = Array.isArray(invData) ? invData : invData?.invoices || [];
    const payments: any[] = Array.isArray(payData) ? payData : payData?.payments || [];

    return [
      ...invoices.map((inv) => {
        const status = String(inv.status || "").toLowerCase();
        const label = inv.invoiceNumber || `INV-${inv.id}`;
        return {
          id: `invoice-${inv.id}-${status}`,
          title:
            status === "paid"
              ? `Invoice ${label} paid`
              : status === "draft"
                ? `Invoice ${label} saved as draft`
                : `Invoice ${label} ${status || "created"}`,
          description: `${inv.customer?.displayName || inv.customerDisplayName || "Customer"} • ${inv.currency || "$"}${inv.total ?? 0}`,
          time: new Date(inv.updatedAt || inv.createdAt || 0).getTime(),
          icon: FileText,
          href: `/invoices/preview/${inv.id}`,
        };
      }),
      ...payments.map((p) => ({
        id: `payment-${p.id}`,
        title: `Payment #${p.paymentNumber || p.id} received`,
        description: `${p.customerDisplayName || "Customer"} • ${p.currency || "$"}${p.amountReceived ?? 0}`,
        time: new Date(p.updatedAt || p.createdAt || 0).getTime(),
        icon: DollarSign,
        href: `/payments/${p.id}`,
      })),
    ]
      .filter((n) => Number.isFinite(n.time) && n.time > 0)
      .sort((a, b) => b.time - a.time);
  }, [invData, payData]);

  const unreadCount = lastSeen ? all.filter((n) => n.time > lastSeen).length : 0;

  const items: NotificationItem[] = useMemo(() => {
    const boundary = highlightAfter ?? lastSeen ?? Infinity;
    return all
      .slice(0, NOTIFICATION_LIMIT)
      .map((n) => ({ ...n, unread: n.time > boundary }));
  }, [all, highlightAfter, lastSeen]);

  /** Call when the drawer opens: clears the badge but keeps rows highlighted. */
  const markAllRead = useCallback(() => {
    setHighlightAfter(lastSeen);
    const now = Date.now();
    writeLastSeen(key, now);
    setLastSeen(now);
  }, [key, lastSeen]);

  return { items, unreadCount, loading: (invLoading || payLoading) && all.length === 0, markAllRead };
};

export default useNotifications;
