"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  Suspense,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { useOrgRouter } from "@/hooks/organization/useOrgRouter";
import { setNavState } from "@/lib/clientNavState";
import { OrgLink } from "@/components/organization/OrgLink";
import {
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  Users,
  Package,
  FileText,
  DollarSign,
  Layout,
} from "lucide-react";
import { useProfile } from "@/hooks/auth/useProfile";
import { useLogout } from "@/hooks/auth/useLogout";
import OrganizationSwitcher from "@/components/organization/OrganizationSwitcher";
import { SearchDropdown, LoadingSpinner, IconButton } from "@/components/ui";
import type { SearchResultItem } from "@/types/common";
import axios from "@/lib/axios";

const getSearchConfig = (routePath: string) => {
  if (
    routePath === "/" ||
    routePath.startsWith("/dashboard") ||
    routePath.startsWith("/customers")
  ) {
    return {
      type: "customers",
      placeholder: "Search customers...",
      basePath: "/customers",
    };
  }
  if (routePath.startsWith("/items")) {
    return {
      type: "items",
      placeholder: "Search items...",
      basePath: "/items",
    };
  }
  if (routePath.startsWith("/invoices")) {
    return {
      type: "invoices",
      placeholder: "Search invoices...",
      basePath: "/invoices",
    };
  }
  if (routePath.startsWith("/payments")) {
    return {
      type: "payments",
      placeholder: "Search payments...",
      basePath: "/payments",
    };
  }
  if (routePath.startsWith("/templates")) {
    return {
      type: "templates",
      placeholder: "Search templates...",
      basePath: "/templates",
    };
  }
  return {
    type: "customers",
    placeholder: "Search customers...",
    basePath: "/customers",
  };
};

const HeaderSearch = () => {
  const pathname = usePathname();
  const router = useOrgRouter();
  // Strip the leading /{orgSlug} segment before matching against the routePath prefixes above
  const routePath = pathname.replace(/^\/[^/]+/, "") || "/dashboard";
  const searchConfig = useMemo(() => getSearchConfig(routePath), [routePath]);

  const handleSearch = useCallback(
    async (searchTerm: string): Promise<SearchResultItem[]> => {
      if (!searchConfig) return [];
      const lower = searchTerm.toLowerCase();

      try {
        if (searchConfig.type === "customers") {
          const res = await axios.get("/customers");
          const customers = res.data?.customers || [];
          return customers
            .filter(
              (c: any) =>
                (c.displayName || "").toLowerCase().includes(lower) ||
                (c.companyName || "").toLowerCase().includes(lower) ||
                (c.email || "").toLowerCase().includes(lower) ||
                (c.phone || "").toLowerCase().includes(lower) ||
                (c.contacts?.[0]?.email || "").toLowerCase().includes(lower) ||
                (c.contacts?.[0]?.contact || "").toLowerCase().includes(lower),
            )
            .map((c: any) => ({
              id: c.id,
              title: c.displayName || c.companyName || "Customer",
              subtitle: [c.companyName, c.contacts?.[0]?.email || c.email]
                .filter(Boolean)
                .join(" • "),
              category: "Customer",
              badge: c.status,
              badgeVariant: c.status === "Active" ? "success" : "default",
              icon: Users,
              href: `/customers/${c.id}`,
              // The details page reads the customer from nav state, so it must
              // be stored before navigating (same as the customers list does).
              onClick: () => {
                setNavState(`customer:${c.id}`, c);
                router.push(`/customers/${c.id}`);
              },
            }));
        }

        if (searchConfig.type === "items") {
          const res = await axios.get("/items");
          const items = res.data?.items || [];
          return items
            .filter(
              (i: any) =>
                (i.name || "").toLowerCase().includes(lower) ||
                (i.description || "").toLowerCase().includes(lower) ||
                (i.unit || "").toLowerCase().includes(lower),
            )
            .map((i: any) => ({
              id: i.id,
              title: i.name || "Item",
              subtitle: `${i.currency || "$"}${i.sellingPrice ?? 0} • ${i.unit || "unit"}`,
              category: "Item",
              badge: i.status,
              badgeVariant: i.status === "Active" ? "success" : "default",
              icon: Package,
              href: `/items/edit/${i.id}`,
            }));
        }

        if (searchConfig.type === "invoices") {
          const res = await axios.get("/invoices");
          const invoices = res.data?.invoices || [];
          return invoices
            .filter(
              (inv: any) =>
                (inv.invoiceNumber || "").toLowerCase().includes(lower) ||
                (inv.customer?.displayName || "")
                  .toLowerCase()
                  .includes(lower) ||
                (inv.customer?.companyName || "")
                  .toLowerCase()
                  .includes(lower) ||
                String(inv.total || "").includes(lower),
            )
            .map((inv: any) => ({
              id: inv.id,
              title: inv.invoiceNumber || `INV-${inv.id}`,
              subtitle: `${inv.customer?.displayName || "Customer"} • ${inv.currency || "$"}${inv.total || 0}`,
              category: "Invoice",
              badge: inv.status,
              badgeVariant:
                String(inv.status).toLowerCase() === "paid"
                  ? "success"
                  : "warning",
              icon: FileText,
              href: `/invoices/preview/${inv.id}`,
            }));
        }

        if (searchConfig.type === "payments") {
          const res = await axios.get("/payments");
          const payments = res.data?.payments || [];
          return payments
            .filter(
              (p: any) =>
                (p.customerDisplayName || "").toLowerCase().includes(lower) ||
                (p.customerEmail || "").toLowerCase().includes(lower) ||
                (p.paymentMode || "").toLowerCase().includes(lower) ||
                (p.referenceNo || "").toLowerCase().includes(lower) ||
                String(p.paymentNumber || "").includes(lower),
            )
            .map((p: any) => ({
              id: p.id,
              title: `Payment #${p.paymentNumber || p.id}`,
              subtitle: `${p.customerDisplayName} • ${p.currency || "$"}${p.amountReceived} (${p.paymentMode})`,
              category: "Payment",
              badge: p.status || "Paid",
              badgeVariant: "success",
              icon: DollarSign,
              href: `/payments/${p.id}`,
            }));
        }

        if (searchConfig.type === "templates") {
          const res = await axios.get("/templates");
          const raw =
            res.data?.templates || (Array.isArray(res.data) ? res.data : []);
          return raw
            .filter(
              (t: any) =>
                (t.templateName || t.name || "")
                  .toLowerCase()
                  .includes(lower) ||
                (t.paperSize || "").toLowerCase().includes(lower),
            )
            .map((t: any) => ({
              id: t.id,
              title: t.templateName || t.name || "Template",
              subtitle: `${t.paperSize || "A4"} • ${t.orientation || "portrait"}`,
              category: "Template",
              icon: Layout,
              href: `/templates/edit/${t.id}`,
            }));
        }

        return [];
      } catch (err) {
        console.error("[HeaderSearch] search error:", err);
        return [];
      }
    },
    [searchConfig, router],
  );

  if (!searchConfig) {
    return <div className="flex-1" />;
  }

  return (
    <div className="w-64 sm:w-72">
      <SearchDropdown
        key={searchConfig.type}
        placeholder={searchConfig.placeholder}
        onSearch={handleSearch}
        dropdownWidth="w-80 sm:w-96"
        emptyMessage={`No matching ${searchConfig.type} found`}
      />
    </div>
  );
};

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: number;
  icon: typeof FileText;
  href: string;
}

const formatTimeAgo = (time: number) => {
  const mins = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : new Date(time).toLocaleDateString();
};

const NOTIFICATION_LIMIT = 8;

const useNotifications = (enabled: boolean) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, payRes] = await Promise.all([
        axios.get("/invoices").catch(() => null),
        axios.get("/payments").catch(() => null),
      ]);
      const invoices: any[] = invRes?.data?.invoices || [];
      const payments: any[] = payRes?.data?.payments || [];

      const next: NotificationItem[] = [
        ...invoices.map((inv): NotificationItem => {
          const status = String(inv.status || "").toLowerCase();
          const label = inv.invoiceNumber || `INV-${inv.id}`;
          return {
            id: `invoice-${inv.id}`,
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
        ...payments.map(
          (p): NotificationItem => ({
            id: `payment-${p.id}`,
            title: `Payment #${p.paymentNumber || p.id} received`,
            description: `${p.customerDisplayName || "Customer"} • ${p.currency || "$"}${p.amountReceived ?? 0}`,
            time: new Date(p.updatedAt || p.createdAt || 0).getTime(),
            icon: DollarSign,
            href: `/payments/${p.id}`,
          }),
        ),
      ]
        .filter((n) => Number.isFinite(n.time) && n.time > 0)
        .sort((a, b) => b.time - a.time)
        .slice(0, NOTIFICATION_LIMIT);

      setItems(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return { items, loading };
};

const Header = () => {
  const { user, loading: profileLoading } = useProfile();
  const { logout, loading: logoutLoading } = useLogout();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { items: notifications, loading: notificationsLoading } =
    useNotifications(isNotificationOpen);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.name || user?.firstName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user?.name ||
        "Ahmad Shahzad"
      : "Ahmad Shahzad";
  const userEmail = user?.email || "ahmadshahzad@revolutic.net";
  const userInitials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "AS";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  return (
    <header className="w-full bg-white border-b border-slate-200/80 px-6 py-3 sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Context-aware Search (Hidden on Dashboard, active on Customers, Items, Invoices, Payments) */}
      <Suspense fallback={<div className="flex-1" />}>
        <HeaderSearch />
      </Suspense>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Organization Switcher */}
        <OrganizationSwitcher />

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <IconButton
            icon={Bell}
            variant="ghost"
            size="md"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative rounded-xl text-slate-500 hover:text-slate-800"
            label="Notifications"
          />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white pointer-events-none" />
          )}

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Notifications
                </span>
              </div>
              {notificationsLoading && notifications.length === 0 ? (
                <div className="py-6 flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-6 px-4 text-center">
                  <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600">
                    No new notifications
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    We will notify you when payments or invoices update.
                  </p>
                </div>
              ) : (
                <ul className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <li key={n.id}>
                        <OrgLink
                          href={n.href}
                          onClick={() => setIsNotificationOpen(false)}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50"
                        >
                          <span className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-slate-800 truncate">
                              {n.title}
                            </span>
                            <span className="block text-[11px] text-slate-500 truncate">
                              {n.description}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              {formatTimeAgo(n.time)}
                            </span>
                          </span>
                        </OrgLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 sm:pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
              {profileLoading ? (
                <LoadingSpinner size="xs" color="white" />
              ) : user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                userInitials
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {profileLoading ? (
                  <span className="inline-flex items-center pt-0.5">
                    <LoadingSpinner size="xs" color="gray" />
                  </span>
                ) : (
                  displayName
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>

              <div className="py-1">
                <OrgLink
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50/70 hover:text-primary"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>My Account</span>
                </OrgLink>
                <OrgLink
                  href="/settings/placeholders"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50/70 hover:text-primary"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </OrgLink>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={logoutLoading}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50/70 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{logoutLoading ? "Signing Out..." : "Sign Out"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
