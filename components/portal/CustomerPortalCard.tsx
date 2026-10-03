"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Copy, Mail, UserX } from "lucide-react";
import axios from "@/lib/axios";
import { swrFetcher } from "@/lib/swr";
import { Button, Input, Select, StatusBadge, toast } from "@/components/ui";
import { formatDate } from "@/lib/format";

interface PortalUserRow {
  id: number;
  email: string;
  name?: string | null;
  status: "Invited" | "Active" | "Disabled";
  lastLoginAt?: string | null;
  inviteExpiresAt?: string | null;
}

const variant = (s: string) => (s === "Active" ? "success" : s === "Invited" ? "warning" : "gray");

/** Customer Portal access for one customer: invite contacts, copy links, remove access. */
const CustomerPortalCard: React.FC<{ customerId: number; contactEmails: string[] }> = ({
  customerId,
  contactEmails,
}) => {
  const key = `/customers/${customerId}/portal`;
  const { data, mutate } = useSWR<{ users: PortalUserRow[] }>(key, swrFetcher, {
    revalidateOnFocus: false,
  });
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<{ email: string; url: string; emailed: boolean } | null>(null);

  const users = data?.users || [];
  const options = contactEmails.filter(Boolean).map((e) => ({ label: e, value: e }));

  const invite = async (address: string) => {
    if (!address.trim()) return;
    setBusy(true);
    try {
      const res = await axios.post(key, { email: address.trim() });
      setLink({ email: address.trim(), url: res.data.link, emailed: res.data.emailed });
      setEmail("");
      await mutate();
      toast.success(
        res.data.emailed ? `Invitation emailed to ${address}` : "Invitation link created",
        "Portal Invitation",
      );
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to invite customer", "Error");
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

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Customer Portal</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Let this customer view quotes, invoices, payments and projects online.
        </p>
      </div>

      {users.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{u.email}</p>
                <p className="text-xs text-slate-500">
                  {u.status === "Active" && u.lastLoginAt
                    ? `Last signed in ${formatDate(u.lastLoginAt)}`
                    : u.status === "Invited" && u.inviteExpiresAt
                      ? `Invitation expires ${formatDate(u.inviteExpiresAt)}`
                      : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={u.status} variant={variant(u.status)} />
                {u.status !== "Active" && (
                  <Button size="sm" variant="outline" onClick={() => invite(u.email)} disabled={busy}>
                    Resend
                  </Button>
                )}
                {u.status !== "Disabled" && (
                  <Button size="sm" variant="ghost" icon={<UserX className="w-4 h-4" />} onClick={() => remove(u)}>
                    Remove
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        {options.length > 0 && (
          <div className="sm:w-72">
            <Select
              label="Invite a contact"
              placeholder="Choose a contact email"
              options={options}
              value={email}
              onValueChange={setEmail}
              fullWidth
            />
          </div>
        )}
        <div className="sm:w-72">
          <Input
            label={options.length ? "or enter an email" : "Email address"}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Mail className="w-4 h-4" />}
          loading={busy}
          disabled={!email.trim() || busy}
          onClick={() => invite(email)}
        >
          Send Invitation
        </Button>
      </div>

      {link && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
          <p className="font-semibold text-slate-700 mb-1">
            {link.emailed
              ? `Invitation emailed to ${link.email}. You can also share this link:`
              : `Email is not configured. Share this link with ${link.email}:`}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate text-slate-600">{link.url}</code>
            <Button size="sm" variant="outline" icon={<Copy className="w-4 h-4" />} onClick={() => copy(link.url)}>
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortalCard;
