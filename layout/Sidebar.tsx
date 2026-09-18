"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { OrgLink } from "@/components/organization/OrgLink";
import {
  Home,
  User,
  ShoppingBag,
  FileText,
  Layout,
  CircleArrowDown,
  Bookmark,
  Timer,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  Sigma,
  StickyNote,
  ScrollText,
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

// Regular menu items (previous list with updated screenshot icons & sizing)
const MENU_ITEMS = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: User, label: "Customers", path: "/customers" },
  { icon: ShoppingBag, label: "Items", path: "/items" },
  { icon: ScrollText, label: "Invoices", path: "/invoices" },
  { icon: Layout, label: "Invoice Templates", path: "/templates" },
  { icon: CircleArrowDown, label: "Payments", path: "/payments" },
  { icon: Bookmark, label: "Expenses", path: "/expenses" },
  { icon: Timer, label: "Time Tracking", path: "/time-tracking" },
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

  // Strip the leading /{orgSlug} segment so nav comparisons match the literal item paths below
  const routePath = pathname.replace(/^\/[^/]+/, "") || "/dashboard";

  // Check if we're on a template form route
  const isTemplateRoute =
    routePath.startsWith("/templates/new") ||
    routePath.startsWith("/templates/edit");

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
      className={`fixed top-0 left-0 h-full bg-blue-950 transition-all duration-300 ease-in-out z-40
        ${isCollapsed ? "w-20" : "w-64"}
        md:sticky md:top-0 md:h-screen flex flex-col justify-between shadow-2xl text-slate-100
      `}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand / Logo Section */}
        <div className="flex items-center px-6 py-5">
          <Link href="/" className="flex items-center gap-3 w-full">
            {/* Logo Icon */}
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 overflow-hidden shadow-md shadow-blue-600/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/InvoiceSmartyIcon.png"
                alt="InvoiceSmarty"
                className="w-full h-full object-contain"
              />
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
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {isTemplateRoute && isTemplateFormActive ? (
            // Template Form Navigation
            <>
              {!isCollapsed && (
                <div className="px-3 py-1.5 mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
                    className={`flex w-full cursor-pointer rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all
                      ${isCollapsed ? "justify-center" : "items-center gap-3.5"}
                      ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-100 hover:bg-white/10 hover:text-white"
                      }
                    `}
                    title={item.label}
                  >
                    <IconComp
                      size={20}
                      className={`shrink-0 ${isActive ? "text-white" : "text-slate-200"}`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </>
          ) : (
            // Regular Menu Items
            MENU_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive =
                item.path === "/dashboard"
                  ? routePath === "/dashboard" || routePath === "/"
                  : routePath === item.path ||
                    routePath.startsWith(item.path + "/");

              return (
                <OrgLink
                  key={item.label}
                  href={item.path}
                  prefetch={true}
                  onClick={() => onMenuClick(item.label)}
                  className={`flex w-full cursor-pointer rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 group
                    ${isCollapsed ? "justify-center" : "items-center gap-3.5"}
                    ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-100 hover:bg-white/10 hover:text-white"
                    }
                  `}
                  title={item.label}
                >
                  <IconComp
                    size={20}
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-200 group-hover:text-white"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </OrgLink>
              );
            })
          )}
        </nav>
      </div>

      {/* Bottom Sidebar: Collapse Toggle Only */}
      <div className="p-3 border-t border-blue-900">
        <button
          onClick={() => onToggle(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-xs"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!isCollapsed ? (
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <ChevronLeft size={16} />
            </span>
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
