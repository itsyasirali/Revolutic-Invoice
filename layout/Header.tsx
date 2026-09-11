"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { useProfile } from "@/hooks/auth/useProfile";
import { useLogout } from "@/hooks/auth/useLogout";

const Header = () => {
  const router = useRouter();
  const { user, loading: profileLoading } = useProfile();
  const { logout, loading: logoutLoading } = useLogout();

  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/invoices?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  return (
    <header className="w-full bg-white border-b border-slate-200/80 px-6 py-3 sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Global Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoices, clients, or anything..."
            className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-700 placeholder-slate-400 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none border border-slate-200/80 focus:border-blue-500/50 focus:ring-3 focus:ring-blue-500/10"
          />
        </div>
      </form>

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
