"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, X } from "lucide-react";
import { OrgLink } from "@/components/organization/OrgLink";
import { IconButton, LoadingSpinner } from "@/components/ui";
import useNotifications, { formatTimeAgo } from "@/hooks/notifications/useNotifications";

export const NotificationsDrawer: React.FC = () => {
  const { items, unreadCount, loading, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wasOpen = useRef(false);

  useEffect(() => setMounted(true), []);

  // Opening the drawer counts as reading: clear the badge once per open.
  useEffect(() => {
    if (isOpen && !wasOpen.current) markAllRead();
    wasOpen.current = isOpen;
  }, [isOpen, markAllRead]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <IconButton
        icon={Bell}
        variant="ghost"
        size="md"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-xl text-slate-500 hover:text-slate-800"
        label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-white pointer-events-none">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}

      {mounted &&
        createPortal(
          <>
            <div
              className={`fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60] transition-opacity duration-300 ease-in-out ${
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setIsOpen(false)}
              aria-hidden={!isOpen}
            />

            <div
              onMouseDown={(e) => e.stopPropagation()}
              className={`fixed inset-y-0 right-0 z-[70] w-80 sm:w-96 bg-white flex flex-col h-full border-l border-slate-200 transition-transform duration-300 ease-in-out transform ${
                isOpen
                  ? "translate-x-0 shadow-2xl pointer-events-auto"
                  : "translate-x-full shadow-none pointer-events-none"
              }`}
              role="dialog"
              aria-modal="true"
              aria-hidden={!isOpen}
              aria-label="Notifications"
            >
              <div className="bg-[#f8fafc] px-5 py-4 border-b border-slate-200/80 flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto dropdown-scrollbar">
                {loading ? (
                  <div className="py-10 flex justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="py-12 px-5 text-center">
                    <Bell className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">No new notifications</p>
                    <p className="text-xs text-slate-400 mt-1">
                      We will notify you when payments or invoices update.
                    </p>
                  </div>
                ) : (
                  <ul>
                    {items.map((n) => {
                      const Icon = n.icon;
                      return (
                        <li key={n.id}>
                          <OrgLink
                            href={n.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-start gap-3.5 px-5 py-3.5 border-b border-slate-100/80 transition-colors ${
                              n.unread ? "bg-blue-50/40 hover:bg-blue-50/70" : "hover:bg-slate-50/70"
                            }`}
                          >
                            <span className="w-10 h-10 shrink-0 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                              <Icon className="w-4 h-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold text-slate-900 truncate">
                                {n.title}
                              </span>
                              <span className="block text-xs text-slate-500 truncate mt-0.5">
                                {n.description}
                              </span>
                              <span className="block text-[11px] text-slate-400 mt-1">
                                {formatTimeAgo(n.time)}
                              </span>
                            </span>
                            {n.unread && (
                              <span
                                className="mt-1.5 w-2 h-2 shrink-0 rounded-full bg-rose-500"
                                aria-label="Unread"
                              />
                            )}
                          </OrgLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

export default NotificationsDrawer;
