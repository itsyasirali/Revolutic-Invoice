"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "@/lib/axios";
import { swrFetcher } from "@/lib/swr";
import { toast } from "@/components/ui";

export interface PortalUserRow {
  id: number;
  email: string;
  name?: string | null;
  status: "Invited" | "Active" | "Disabled";
  lastLoginAt?: string | null;
  inviteExpiresAt?: string | null;
}

/** Customer Portal access for one customer: invite contacts, copy links, remove access. */
const useCustomerPortalAccess = (customerId: number, contactEmails: string[]) => {
  const key = `/customers/${customerId}/portal`;
  const { data, mutate } = useSWR<{ users: PortalUserRow[] }>(key, swrFetcher, {
    revalidateOnFocus: false,
  });
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<{ email: string; url: string; emailed: boolean } | null>(null);

  const users = data?.users || [];
  const options = contactEmails.filter(Boolean).map((e) => ({ label: e, value: e }));
  // Portal is "enabled" once someone has been invited or is active; removed access doesn't count.
  const portalEnabled = users.some((u) => u.status !== "Disabled");

  /** Returns true when the invitation was created. */
  const invite = async (address: string): Promise<boolean> => {
    if (!address.trim()) return false;
    setBusy(true);
    try {
      const res = await axios.post(key, { email: address.trim() });
      setLink(res.data.emailed ? null : { email: address.trim(), url: res.data.link, emailed: false });
      setEmail("");
      await mutate();
      toast.success(
        res.data.emailed ? `Invitation emailed to ${address}` : "Invitation link created",
        "Portal Invitation",
      );
      return true;
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to invite customer", "Error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const remove = async (u: PortalUserRow) => {
    try {
      await axios.delete(`${key}?userId=${u.id}`);
      await mutate();
      toast.success(`Portal access removed for ${u.email}`, "Access Removed");
    } catch {
      toast.error("Failed to remove portal access", "Error");
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard", "Copied");
    } catch {
      toast.error("Could not copy the link", "Error");
    }
  };

  return { loaded: !!data, users, options, portalEnabled, email, setEmail, busy, link, setLink, invite, remove, copy };
};

export default useCustomerPortalAccess;
