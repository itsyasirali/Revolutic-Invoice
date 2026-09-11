"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { SearchDropdown } from "@/components/ui";
import type { SearchResultItem } from "@/types/common";
import axios from "@/lib/axios";

const getSearchConfig = (pathname: string) => {
  if (pathname === "/" || pathname.startsWith("/customers")) {
    return {
      type: "customers",
      placeholder: "Search customers...",
      basePath: "/customers",
    };
  }
  if (pathname.startsWith("/items")) {
    return {
      type: "items",
      placeholder: "Search items...",
      basePath: "/items",
    };
  }
  if (pathname.startsWith("/invoices")) {
    return {
      type: "invoices",
      placeholder: "Search invoices...",
      basePath: "/invoices",
    };
  }
  if (pathname.startsWith("/payments")) {
    return {
      type: "payments",
      placeholder: "Search payments...",
      basePath: "/payments",
    };
  }
  if (pathname.startsWith("/templates")) {
    return {
      type: "templates",
      placeholder: "Search templates...",
      basePath: "/templates",
    };
  }
  return null;
};

const HeaderSearch = () => {
  const pathname = usePathname();
  const searchConfig = useMemo(() => getSearchConfig(pathname), [pathname]);

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
                (inv.customer?.displayName || "").toLowerCase().includes(lower) ||
                (inv.customer?.companyName || "").toLowerCase().includes(lower) ||
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
                (t.templateName || t.name || "").toLowerCase().includes(lower) ||
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
    [searchConfig],
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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
      <div className="flex items-center gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Notifications
                </span>
              </div>
              <div className="py-6 px-4 text-center">
                <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  No new notifications
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  We will notify you when payments or invoices update.
                </p>
              </div>
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
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {profileLoading ? "..." : userInitials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {profileLoading ? "Loading..." : displayName}
              </p>
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
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50/70 hover:text-blue-600"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>My Account</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50/70 hover:text-blue-600"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>
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
