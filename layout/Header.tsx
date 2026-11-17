"use client";
import { dropdownAnim, DROPDOWN_BASE } from "@/lib/dropdownAnim";

import React, {
  useState,
  useRef,
  useEffect,
  Suspense,
} from "react";
import { OrgLink } from "@/components/organization/OrgLink";
import {
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { useProfile } from "@/hooks/auth/useProfile";
import { useLogout } from "@/hooks/auth/useLogout";
import OrganizationSwitcher from "@/components/organization/OrganizationSwitcher";
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer";
import { SearchDropdown, LoadingSpinner } from "@/components/ui";
import useHeaderSearch from "@/hooks/common/useHeaderSearch";

const HeaderSearch = () => {
  const { searchConfig, handleSearch } = useHeaderSearch();

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
