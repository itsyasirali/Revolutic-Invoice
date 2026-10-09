"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  ScrollText,
  CircleArrowDown,
  FolderKanban,
  Scale,
  User as UserIcon,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { mutate } from "swr";
import { portalSend, usePortalMe } from "@/lib/portalApi";
import { PageLoading } from "./PortalUI";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  visible: boolean;
}

/** Open records (e.g. /portal/invoices/12) render a full-bleed master/detail split view (no page padding). */
const SPLIT_ROUTES = ["/portal/invoices", "/portal/quotes", "/portal/payments", "/portal/projects"];

const PortalShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { me, unauthorized, loading } = usePortalMe();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (unauthorized) router.replace("/portal/login");
  }, [unauthorized, router]);

  // Same behaviour as the main sidebar: icons only on small screens.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) setIsCollapsed(true);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  if (loading || !me) {
    return <div className="min-h-screen bg-white">{unauthorized ? null : <PageLoading />}</div>;
  }

  const s = me.settings;
  const nav: NavItem[] = [
    { href: "/portal", label: "Dashboard", icon: Home, visible: true },
    { href: "/portal/quotes", label: "Quotes", icon: FileText, visible: s.canViewQuotes },
    { href: "/portal/invoices", label: "Invoices", icon: ScrollText, visible: s.canViewInvoices },
    { href: "/portal/payments", label: "Payments", icon: CircleArrowDown, visible: s.canViewPayments },
    { href: "/portal/projects", label: "Projects", icon: FolderKanban, visible: s.canViewProjects },
    { href: "/portal/statements", label: "Statements", icon: Scale, visible: s.canViewInvoices },
    { href: "/portal/profile", label: "Profile", icon: UserIcon, visible: true },
  ].filter((i) => i.visible);

  const isActive = (href: string) =>
    href === "/portal" ? pathname === "/portal" : pathname === href || pathname.startsWith(href + "/");

  const signOut = async () => {
    setIsProfileOpen(false);
    try {
      await portalSend("POST", "/auth/logout");
    } finally {
      await mutate(() => true, undefined, { revalidate: false });
      router.replace("/portal/login");
    }
  };

  const portalName = s.portalName || me.organization.name;
  const displayName = me.user.name || me.customer.displayName || "Customer";
  const initials =
    displayName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "CU";
  const isSplit = SPLIT_ROUTES.some((r) => pathname.startsWith(r + "/"));

  return (
    <div className="flex min-h-screen bg-white text-slate-800">
      {/* Sidebar (same look as the main app) */}
      <aside
        className={`fixed top-0 left-0 h-full bg-blue-950 transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? "w-20" : "w-64"}
          md:sticky md:top-0 md:h-screen flex flex-col justify-between shadow-2xl text-slate-100 print:hidden
        `}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center px-6 py-5">
            <Link href="/portal" className="flex items-center gap-3 w-full min-w-0">
              {me.organization.logoUrl ? (
                <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 overflow-hidden shadow-md shadow-blue-600/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={me.organization.logoUrl} alt="" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-md bg-primary text-white flex items-center justify-center shrink-0 text-sm font-bold">
                  {portalName.charAt(0).toUpperCase()}
                </div>
              )}
              {!isCollapsed && (
                <span className="truncate tracking-tight text-lg font-bold text-white">{portalName}</span>
              )}
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  title={item.label}
                  className={`flex w-full cursor-pointer rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 group
                    ${isCollapsed ? "justify-center" : "items-center gap-3.5"}
                    ${active ? "bg-primary text-white shadow-sm" : "text-slate-100 hover:bg-white/10 hover:text-white"}
                  `}
                >
                  <item.icon
                    size={20}
                    className={`shrink-0 transition-colors ${
                      active ? "text-white" : "text-slate-200 group-hover:text-white"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-blue-900">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-xs"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (same look as the main app) */}
        <header className="w-full bg-white border-b border-slate-200/80 px-6 py-3 sticky top-0 z-30 flex items-center justify-between gap-4 print:hidden">
          <div className="min-w-0 text-sm font-semibold text-slate-800 truncate">{me.customer.displayName}</div>

          <div className="relative shrink-0" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1 sm:pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{displayName}</div>
                <p className="text-[10px] text-slate-400 leading-tight">Customer</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            <div
              aria-hidden={!isProfileOpen}
              className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 transition-all duration-300 ease-in-out ${
                isProfileOpen
                  ? "opacity-100 visible [clip-path:inset(0_-24px_-24px_-24px)]"
                  : "opacity-0 invisible pointer-events-none [clip-path:inset(0_-24px_100%_-24px)]"
              }`}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{me.user.email}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/portal/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50/70 hover:text-primary"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>My Account</span>
                </Link>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50/70 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {s.bannerMessage && (
          <div className="bg-primary/10 text-primary text-[13px] font-medium px-6 py-2.5 print:hidden">
            {s.bannerMessage}
          </div>
        )}

        <main className={`w-full flex-1 ${isSplit ? "" : "py-2"} print:p-0`}>{children}</main>
      </div>
    </div>
  );
};

export default PortalShell;
