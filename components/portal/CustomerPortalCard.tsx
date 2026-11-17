"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Globe, Mail, UserX, X } from "lucide-react";
import useCustomerPortalAccess from "@/hooks/portal/useCustomerPortalAccess";
import { Button, Select, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";

const variant = (s: string) => (s === "Active" ? "success" : s === "Invited" ? "warning" : "gray");

/** Customer Portal access for one customer: invite contacts, copy links, remove access. */
const CustomerPortalCard: React.FC<{ customerId: number; contactEmails: string[] }> = ({
  customerId,
  contactEmails,
}) => {
  const { loaded, users, options, portalEnabled, email, setEmail, busy, link, invite, remove, copy } =
    useCustomerPortalAccess(customerId, contactEmails);
  // UI-only state: modal visibility and portal mount flag.
  const [enableOpen, setEnableOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sendInvite = async (address: string) => {
    if (await invite(address)) setEnableOpen(false);
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
                  <Button size="sm" variant="outline" onClick={() => sendInvite(u.email)} disabled={busy}>
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

      {loaded && !portalEnabled && (
        <div>
          <Button
            variant="primary"
            size="md"
            icon={<Globe className="w-4 h-4" />}
            onClick={() => setEnableOpen(true)}
          >
            Enable Portal
          </Button>
        </div>
      )}

      {mounted &&
        enableOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => !busy && setEnableOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-b-xl border-x border-b border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start gap-4 p-6 pb-4">
                <div className="p-2.5 rounded-md bg-white shadow-sm shrink-0 text-primary">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900">Enable Customer Portal</h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Send an invitation so this customer can view quotes, invoices, payments and projects online.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setEnableOpen(false)}
                  disabled={busy}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 pb-2">
                {options.length > 0 ? (
                  <Select
                    label="Invite a contact"
                    placeholder="Choose a contact email"
                    options={options}
                    value={email}
                    onValueChange={setEmail}
                    fullWidth
                  />
                ) : (
                  <p className="text-sm text-slate-500">
                    Add a contact with an email address to this customer to enable portal access.
                  </p>
                )}
              </div>

              <div className="flex gap-2.5 justify-end px-6 py-4">
                <Button variant="outline" size="sm" onClick={() => setEnableOpen(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Mail className="w-4 h-4" />}
                  loading={busy}
                  disabled={!email.trim() || busy || options.length === 0}
                  onClick={() => sendInvite(email)}
                >
                  Send Invitation
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {link && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
          <p className="font-semibold text-slate-700 mb-1">
            Email is not configured. Share this link with {link.email}:
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
