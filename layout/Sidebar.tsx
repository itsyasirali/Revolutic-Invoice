"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Package,
  FileText,
  DollarSign,
  Clock,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Layout,
  Table as TableIcon,
  Sigma,
  StickyNote,
  ReceiptText,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import {
  useTemplateFormContext,
  type TemplateNavItem,
} from "@/context/TemplateFormContext";

interface SidebarProps {
  activeItem: string;
  onMenuClick: (item: string) => void;
  isCollapsed: boolean;
  onToggle: (collapsed?: boolean) => void;
}

// Template form navigation items
const TEMPLATE_NAV_ITEMS: {
  id: TemplateNavItem;
  icon: LucideIcon;
  label: string;
}[] = [
  { id: "general", icon: Layout, label: "General" },
  { id: "header", icon: FileText, label: "Header & Footer" },
  { id: "table", icon: TableIcon, label: "Table" },
  { id: "total", icon: Sigma, label: "Total" },
  { id: "notes", icon: StickyNote, label: "Notes & Bank" },
];

// Regular menu items
const MENU_ITEMS = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: Package, label: "Items", path: "/items" },
  { icon: ReceiptText, label: "Invoices", path: "/invoices" },
  { icon: Layout, label: "Invoice Templates", path: "/templates" },
  { icon: DollarSign, label: "Payments", path: "/payments" },
  { icon: Receipt, label: "Expenses", path: "/expenses" },
  { icon: Clock, label: "Time Tracking", path: "/time-tracking" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  onMenuClick,
  isCollapsed,
  onToggle,
}) => {
  const pathname = usePathname();
  const { activeNav, setActiveNav, isTemplateFormActive } =
    useTemplateFormContext();

  // Check if we're on a template form route
  const isTemplateRoute =
    pathname.startsWith("/templates/new") ||
    pathname.startsWith("/templates/edit");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isCollapsed) {
        onToggle(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed, onToggle]);

  const handleTemplateNavClick = (navId: TemplateNavItem) => {
    setActiveNav(navId);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#0B0F19] border-r border-slate-800 transition-all duration-300 ease-in-out z-40
        ${isCollapsed ? "w-20" : "w-64"}
        md:sticky md:top-0 md:h-screen flex flex-col justify-between shadow-2xl text-slate-300
      `}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand / Logo Section */}
        <div className="flex items-center px-6 py-5 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 w-full">
            {/* Logo Icon */}
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-600/30">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="4" />
                <path d="M7 8h10" />
                <path d="M7 12h10" />
                <path d="M7 16h6" />
              </svg>
            </div>

            {!isCollapsed && (
              <div className="flex items-center tracking-tight text-lg font-bold">
                <span className="text-white">Invoice</span>
                <span className="text-primary">Smarty</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {isTemplateRoute && isTemplateFormActive ? (
            // Template Form Navigation
            <>
              {!isCollapsed && (
                <div className="px-3 py-1.5 mb-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Template Settings
                  </span>
                </div>
              )}
              {TEMPLATE_NAV_ITEMS.map((item) => {
                const IconComp = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTemplateNavClick(item.id)}
                    className={`flex w-full cursor-pointer rounded-md px-3.5 py-2.5 text-xs transition-all
                      ${isCollapsed ? "justify-center" : "items-center gap-3"}
                      ${
                        isActive
                          ? "bg-primary text-white font-semibold shadow-md shadow-blue-500/25"
                          : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                      }
                    `}
                    title={item.label}
                  >
                    <IconComp
                      size={18}
                      className={`shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}

              {/* Back to Templates List */}
              <div className="border-t border-slate-800/80 mt-4 pt-3">
                <Link
                  href="/templates"
                  prefetch={true}
                  className={`flex w-full rounded-md px-3.5 py-2.5 text-xs transition-all
                    ${isCollapsed ? "justify-center" : "items-center gap-3"}
                    text-slate-400 hover:bg-slate-800/70 hover:text-white font-medium
                  `}
                  title="Back to Templates"
                >
                  <ChevronLeft size={18} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">Back to Templates</span>
                  )}
                </Link>
              </div>
            </>
          ) : (
            // Regular Menu Items
            MENU_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive =
                item.path === "/"
                  ? pathname === "/"
                  : pathname === item.path || pathname.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  href={item.path}
                  prefetch={true}
                  onClick={() => onMenuClick(item.label)}
                  className={`flex w-full cursor-pointer rounded-md px-3.5 py-2.5 text-sm transition-all duration-150 group
                    ${isCollapsed ? "justify-center" : "items-center gap-3"}
                    ${
                      isActive
                        ? "bg-primary text-white font-semibold shadow-md shadow-blue-500/25"
                        : "text-slate-400 hover:bg-slate-800/70 hover:text-white font-medium"
                    }
                  `}
                  title={item.label}
                >
                  <IconComp
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })
          )}
        </nav>
      </div>

      {/* Bottom Sidebar: Collapse Toggle Only */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090D16]">
        <button
          onClick={() => onToggle(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer text-xs"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!isCollapsed ? (
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <ChevronLeft size={15} /> Collapse
            </span>
          ) : (
            <ChevronRight size={15} />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
