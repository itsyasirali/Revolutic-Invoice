"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import axios from "@/lib/axios";
import { swrFetcher } from "@/lib/swr";
import { Button, Input, Checkbox, PageHeader, LoadingSpinner, StatusBadge, toast } from "@/components/ui";
import { OrgLink as Link } from "@/components/organization/OrgLink";
import { formatDate } from "@/lib/format";
import { DEFAULT_PORTAL_SETTINGS, type PortalSettings } from "@/types/portal";

interface ActivityRow {
  id: number;
  type: string;
  title?: string | null;
  customerId: number;
  customerName?: string;
  entityType?: string | null;
  entityId?: number | null;
  readAt?: string | null;
  createdAt: string;
}

const PERMISSIONS: { key: keyof PortalSettings; label: string }[] = [
  { key: "canViewInvoices", label: "Customers can view invoices and statements" },
  { key: "canViewQuotes", label: "Customers can view and respond to quotes" },
  { key: "canViewPayments", label: "Customers can view payments" },
  { key: "canViewProjects", label: "Customers can view projects" },
  { key: "canViewTimesheets", label: "Customers can view timesheets" },
  { key: "canApproveTimesheets", label: "Customers can approve or reject timesheets" },
  { key: "canComment", label: "Customers can comment" },
  { key: "canEditProfile", label: "Customers can edit their profile" },
];

const NOTIFICATIONS: { key: keyof PortalSettings["notify"]; label: string }[] = [
  { key: "invoiceViewed", label: "Invoice viewed" },
  { key: "quoteViewed", label: "Quote viewed" },
  { key: "quoteAccepted", label: "Quote accepted" },
  { key: "quoteDeclined", label: "Quote declined" },
  { key: "comment", label: "Customer comment" },
  { key: "timeApproval", label: "Time approved or rejected" },
  { key: "profileUpdated", label: "Customer updated their profile" },
];

const href = (a: ActivityRow) =>
  a.entityType === "invoice" && a.entityId
    ? `/invoices/${a.entityId}`
    : a.entityType === "quote" && a.entityId
      ? `/quotes/${a.entityId}`
      : a.entityType === "project" && a.entityId
        ? `/projects/${a.entityId}`
        : a.entityType === "customer"
          ? `/customers/${a.customerId}`
          : null;

const PortalSettingsPage: React.FC = () => {
  const { data, isLoading } = useSWR<{ settings: PortalSettings }>("/portal-admin/settings", swrFetcher, {
    revalidateOnFocus: false,
  });
  const activity = useSWR<{ activities: ActivityRow[]; unread: number }>("/portal-admin/activity", swrFetcher);
  const [form, setForm] = useState<PortalSettings>(DEFAULT_PORTAL_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  const set = <K extends keyof PortalSettings>(key: K, value: PortalSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await axios.put("/portal-admin/settings", form);
      toast.success("Portal settings saved", "Saved");
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to save settings", "Error");
    } finally {
      setSaving(false);
    }
  };

  const markRead = async () => {
    await axios.post("/portal-admin/activity");
    await activity.mutate();
  };

  const section = "bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4";
  const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/portal/login` : "/portal/login";

  return (
    <div className="pb-8">
      <PageHeader
        title="Customer Portal"
        actions={
          <Button variant="primary" size="sm" onClick={save} loading={saving} disabled={saving}>
            Save Settings
          </Button>
        }
      />

      <div className="px-2 sm:px-4 md:px-6 mt-4 space-y-6 max-w-4xl">
        <div className={section}>
          <h2 className="text-base font-bold text-slate-900">General</h2>
          <Checkbox
            label="Enable customer portal"
            description="When off, customers cannot sign in."
            checked={form.enabled}
            onChange={(e) => set("enabled", e.target.checked)}
          />
          <p className="text-xs text-slate-500">
            Portal sign-in page: <code className="text-slate-700">{portalUrl}</code>
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Portal name"
              placeholder="Defaults to your organization name"
              value={form.portalName}
              onChange={(e) => set("portalName", e.target.value)}
              fullWidth
            />
            <Input
              label="Welcome message"
              value={form.welcomeMessage}
              onChange={(e) => set("welcomeMessage", e.target.value)}
              fullWidth
            />
          </div>
          <Input
            label="Banner message"
            placeholder="Shown at the top of every portal page"
            value={form.bannerMessage}
            onChange={(e) => set("bannerMessage", e.target.value)}
            fullWidth
          />
        </div>

        <div className={section}>
          <h2 className="text-base font-bold text-slate-900">Permissions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PERMISSIONS.map((p) => (
              <Checkbox
                key={p.key}
                label={p.label}
                checked={form[p.key] as boolean}
                onChange={(e) => set(p.key, e.target.checked as never)}
              />
            ))}
          </div>
          <Checkbox
            label="Require customer approval before project time can be invoiced"
            description="Billable project time must be approved in the portal first."
            checked={form.requireTimeApproval}
            onChange={(e) => set("requireTimeApproval", e.target.checked)}
          />
        </div>

        <div className={section}>
          <h2 className="text-base font-bold text-slate-900">Notifications</h2>
          <p className="text-xs text-slate-500">Choose which customer actions appear in the activity feed below.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {NOTIFICATIONS.map((n) => (
              <Checkbox
                key={n.key}
                label={n.label}
                checked={form.notify[n.key]}
                onChange={(e) => set("notify", { ...form.notify, [n.key]: e.target.checked })}
              />
            ))}
          </div>
        </div>

        <div className={section}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Portal Activity
              {!!activity.data?.unread && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary">
                  {activity.data.unread} new
                </span>
              )}
            </h2>
            {!!activity.data?.unread && (
              <Button size="sm" variant="outline" onClick={markRead}>
                Mark all read
              </Button>
            )}
          </div>
          {(activity.data?.activities || []).length === 0 ? (
            <p className="text-sm text-slate-500">No customer activity yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activity.data?.activities.map((a) => {
                const target = href(a);
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className={`truncate ${a.readAt ? "text-slate-600" : "font-semibold text-slate-900"}`}>
                        {target ? (
                          <Link href={target} className="hover:text-primary">
                            {a.title}
                          </Link>
                        ) : (
                          a.title
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {a.customerName} · {formatDate(a.createdAt)}
                      </p>
                    </div>
                    {!a.readAt && <StatusBadge status="New" variant="primary" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalSettingsPage;
