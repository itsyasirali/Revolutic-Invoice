"use client";
import { dropdownAnim, DROPDOWN_BASE } from "@/lib/dropdownAnim";

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
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer";
import { SearchDropdown, LoadingSpinner } from "@/components/ui";
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
  if (routePath.startsWith("/projects")) {
    return { type: "projects", placeholder: "Search projects...", basePath: "/projects" };
  }
  if (routePath.startsWith("/quotes")) {
    return { type: "quotes", placeholder: "Search quotes...", basePath: "/quotes" };
  }
  if (routePath.startsWith("/expenses")) {
    return { type: "expenses", placeholder: "Search expenses...", basePath: "/expenses" };
  }
  if (routePath.startsWith("/time-tracking")) {
    return { type: "time entries", placeholder: "Search time entries...", basePath: "/time-tracking" };
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
              href: `/items/${i.id}`,
              onClick: () => {
                setNavState(`item:${i.id}`, i);
                router.push(`/items/${i.id}`);
              },
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

        if (searchConfig.type === "projects") {
          const res = await axios.get("/projects");
          return (res.data?.projects || [])
            .filter((p: any) =>
              [p.projectNumber, p.name, p.customer?.displayName, p.customer?.companyName].some((v) =>
                String(v || "").toLowerCase().includes(lower),
              ),
            )
            .map((p: any) => ({
              id: p.id,
              title: p.name,
              subtitle: `${p.projectNumber} \u2022 ${p.customer?.displayName || "Customer"}`,
              category: "Project",
              badge: p.status,
              badgeVariant: p.status === "Active" ? "success" : "warning",
              icon: FileText,
              href: `/projects/${p.id}`,
            }));
        }

        if (searchConfig.type === "quotes") {
          const res = await axios.get("/quotes");
          return (res.data?.quotes || [])
            .filter((q: any) =>
              [q.quoteNumber, q.referenceNumber, q.customer?.displayName, q.customer?.companyName].some((v) =>
                String(v || "").toLowerCase().includes(lower),
              ),
            )
            .map((q: any) => ({
              id: q.id,
              title: q.quoteNumber,
              subtitle: `${q.customer?.displayName || "Customer"} • ${q.currency || ""} ${q.total ?? 0}`,
              category: "Quote",
              badge: q.status,
              badgeVariant: "warning",
              icon: FileText,
              href: `/quotes/${q.id}`,
            }));
        }

        if (searchConfig.type === "expenses") {
          const res = await axios.get("/expenses");
          return (res.data?.expenses || [])
            .filter((e: any) =>
              [e.expenseNumber, e.vendor, e.description, e.category?.name, e.customer?.displayName].some((v) =>
                String(v || "").toLowerCase().includes(lower),
              ),
            )
            .map((e: any) => ({
              id: e.id,
              title: e.expenseNumber,
              subtitle: `${e.vendor || e.category?.name || "Expense"} • ${e.currency || ""} ${e.total ?? 0}`,
              category: "Expense",
              badge: e.status,
              badgeVariant: "warning",
              icon: DollarSign,
              href: `/expenses/${e.id}`,
            }));
        }

        if (searchConfig.type === "time entries") {
          const res = await axios.get("/time-tracking");
          return (res.data?.timeEntries || [])
            .filter((t: any) =>
              [t.entryNumber, t.project, t.description, t.customer?.displayName].some((v) =>
                String(v || "").toLowerCase().includes(lower),
              ),
            )
            .map((t: any) => ({
              id: t.id,
              title: t.entryNumber || `Entry ${t.id}`,
              subtitle: [t.customer?.displayName, t.project, t.description].filter(Boolean).join(" • "),
              category: "Time Entry",
              badge: t.status,
              badgeVariant: "warning",
              icon: FileText,
              href: `/time-tracking/${t.id}`,
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

const Header = () => {
  const { user, loading: profileLoading } = useProfile();
  const { logout, loading: logoutLoading } = useLogout();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

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

        {/* Notifications */}
        <NotificationsDrawer />

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
          {(
            <div
              aria-hidden={!isProfileOpen}
              className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 ${DROPDOWN_BASE} ${dropdownAnim(isProfileOpen)}`}
            >
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
