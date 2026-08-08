"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Users,
  Package,
  FileText,
  Receipt,
  DollarSign,
  Clock,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Layout,
  Table as TableIcon,
  Sigma,
  StickyNote,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useTemplateFormContext,
  type TemplateNavItem,
} from "@/context/TemplateFormContext";
import { useProfile } from "@/hooks/auth/useProfile";
import { useLogout } from "@/hooks/auth/useLogout";

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
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: Package, label: "Items", path: "/items" },
  { icon: FileText, label: "Invoices", path: "/invoices" },
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
  const router = useRouter();
  const pathname = usePathname();
  const { activeNav, setActiveNav, isTemplateFormActive } =
    useTemplateFormContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, loading: profileLoading } = useProfile();
  const { logout, loading: logoutLoading } = useLogout();

  const userName = user?.name || user?.firstName || "User";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

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

  const handleClick = (item: string, path: string) => {
    onMenuClick(item);
    router.push(path);
  };

  const handleTemplateNavClick = (navId: TemplateNavItem) => {
    setActiveNav(navId);
  };

  const handleMyAccount = () => {
    setIsProfileOpen(false);
    router.push("/profile");
  };

  const handleSignOut = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-slate-900 transition-all duration-300 ease-in-out z-40
        ${isCollapsed ? "w-16" : "w-56"}
        md:sticky md:top-0 md:h-screen
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header Section - Logo Only */}
        <div className="flex items-center justify-center p-3 border-b border-slate-800">
          {!isCollapsed ? (
            <div className="flex items-center justify-center w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/revolutic-logo-white.svg"
                alt="Logo"
                className="h-6 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/Icon.png" alt="Icon" className="h-8 w-8 object-contain" />
            </div>
          )}
        </div>

        {/* Menu / Template Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-700">
          {isTemplateRoute && isTemplateFormActive ? (
            // Template Form Navigation
            <>
              {!isCollapsed && (
                <div className="px-4 py-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                    className={`flex w-[90%] cursor-pointer cursor-pointer mx-auto rounded-md px-2 py-2 my-0.5 text-xs transition-all
                      ${isCollapsed ? "flex-col justify-center items-center gap-0.5" : "items-center gap-2"}
                      ${
                        isActive
                          ? "bg-primary text-white shadow-md"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }
                    `}
                    title={item.label}
                  >
                    <IconComp size={16} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-xs truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}

              {/* Back to Templates List */}
              <div className="border-t border-slate-800 mt-4 pt-4">
                <button
                  onClick={() => router.push("/templates")}
                  className={`flex w-[90%] mx-auto rounded-md px-2 py-2 text-xs transition-all
                    ${isCollapsed ? "flex-col justify-center items-center gap-0.5" : "items-center gap-2"}
                    text-slate-400 hover:bg-slate-700 hover:text-white
                  `}
                  title="Back to Templates"
                >
                  <ChevronLeft size={16} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-xs truncate">Back to Templates</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            // Regular Menu Items
            MENU_ITEMS.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item.label, item.path)}
                  className={`flex w-[90%] mx-auto cursor-pointer rounded-md px-2 py-2 my-0.5 text-xs transition-all
                    ${isCollapsed ? "flex-col justify-center items-center gap-0.5" : "items-center gap-2"}
                    ${
                      pathname === item.path ||
                      (item.path !== "/" &&
                        pathname.startsWith(item.path))
                        ? "bg-primary text-white shadow-md"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }
                  `}
                  title={item.label}
                >
                  <IconComp size={16} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-xs truncate">{item.label}</span>
                  )}
                </button>
              );
            })
          )}
        </nav>

        {/* Profile Section */}
        <div className="border-t border-slate-800 p-2 relative">
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer hover:bg-slate-700 transition-colors
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {profileLoading ? "..." : userInitial}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-white truncate">
                  {profileLoading ? "Loading..." : userName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {profileLoading ? "" : userEmail}
                </p>
              </div>
            )}
          </div>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div
                className={`absolute bottom-full mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50
                  ${isCollapsed ? "left-14" : "left-2 right-2"}
                `}
              >
                {/* Profile Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {userInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {profileLoading ? "Loading..." : userName}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {profileLoading ? "" : userEmail}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen(false)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="py-2">
                  <button
                    type="button"
                    onClick={handleMyAccount}
                    className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    My Account
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={logoutLoading}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    {logoutLoading ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Toggle Button at Bottom */}
        <div className="border-t border-slate-800 p-2">
          <button
            onClick={() => onToggle(!isCollapsed)}
            className={`w-full flex items-center justify-center p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors
              ${isCollapsed ? "flex-col gap-1" : "gap-2"}
            `}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {!isCollapsed ? (
              <>
                <ChevronLeft size={18} />
              </>
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
