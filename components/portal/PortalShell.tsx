"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ScrollText,
  CircleArrowDown,
  FolderKanban,
  Scale,
  UserRound,
  LogOut,
  Menu,
  X,
  Ellipsis,
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

const PortalShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { me, unauthorized, loading } = usePortalMe();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (unauthorized) router.replace("/portal/login");
  }, [unauthorized, router]);

  useEffect(() => setDrawer(false), [pathname]);

  if (loading || !me) {
    return <div className="min-h-screen bg-slate-50">{unauthorized ? null : <PageLoading />}</div>;
  }

  const s = me.settings;
  const nav: NavItem[] = [
    { href: "/portal", label: "Dashboard", icon: LayoutDashboard, visible: true },
    { href: "/portal/quotes", label: "Quotes", icon: FileText, visible: s.canViewQuotes },
    { href: "/portal/invoices", label: "Invoices", icon: ScrollText, visible: s.canViewInvoices },
    { href: "/portal/payments", label: "Payments", icon: CircleArrowDown, visible: s.canViewPayments },
    { href: "/portal/projects", label: "Projects", icon: FolderKanban, visible: s.canViewProjects },
    { href: "/portal/statements", label: "Statements", icon: Scale, visible: s.canViewInvoices },
    { href: "/portal/profile", label: "Profile", icon: UserRound, visible: true },
  ].filter((i) => i.visible);

  const isActive = (href: string) =>
    href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);

  const signOut = async () => {
    try {
      await portalSend("POST", "/auth/logout");
    } finally {
      await mutate(() => true, undefined, { revalidate: false });
      router.replace("/portal/login");
    }
  };

  const portalName = s.portalName || me.organization.name;
  const links = (onClick?: () => void) =>
    nav.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 h-10 rounded-lg text-[14px] font-medium transition-colors ${
          isActive(item.href) ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <item.icon className="w-[18px] h-[18px]" />
        {item.label}
      </Link>
    ));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 print:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="lg:hidden p-2 -ml-2 text-slate-600 cursor-pointer"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {me.organization.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.organization.logoUrl} alt="" className="h-8 w-8 rounded-md object-contain" />
          ) : (
            <div className="h-8 w-8 rounded-md bg-primary text-white flex items-center justify-center text-[14px] font-bold">
              {portalName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-[15px] font-semibold truncate">{portalName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-[13px] font-semibold">{me.user.name || me.customer.displayName}</p>
            <p className="text-[12px] text-slate-500">{me.user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-300 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed top-16 bottom-0 left-0 w-60 flex-col bg-white border-r border-slate-200 p-3 gap-1 print:hidden">
        {links()}
        <div className="mt-auto px-3 py-3 text-[12px] text-slate-500 leading-4">
          <p className="font-semibold text-slate-700">{me.customer.displayName}</p>
          {me.organization.email && <p>{me.organization.email}</p>}
          {me.organization.phone && <p>{me.organization.phone}</p>}
        </div>
      </aside>

      {/* Drawer (mobile) */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-40 print:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white p-3 flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 h-12">
              <span className="text-[15px] font-semibold">{portalName}</span>
              <button onClick={() => setDrawer(false)} className="p-2 cursor-pointer" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            {links(() => setDrawer(false))}
          </div>
        </div>
      )}

      <main className="pt-16 lg:pl-60 pb-20 lg:pb-8 print:pt-0 print:pl-0">
        {s.bannerMessage && (
          <div className="bg-primary/10 text-primary text-[13px] font-medium px-4 sm:px-6 py-2.5 print:hidden">
            {s.bannerMessage}
          </div>
        )}
        <div className="px-4 sm:px-6 py-6 max-w-[1200px]">{children}</div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white border-t border-slate-200 grid grid-cols-5 print:hidden">
        {nav.slice(0, 4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
              isActive(item.href) ? "text-primary" : "text-slate-500"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
        <button
          onClick={() => setDrawer(true)}
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-500 cursor-pointer"
        >
          <Ellipsis className="w-5 h-5" />
          More
        </button>
      </nav>
    </div>
  );
};

export default PortalShell;
