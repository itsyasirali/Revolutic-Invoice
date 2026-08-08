"use client";

import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, X, LayoutGrid, ShoppingCart, ShoppingBag, PlusCircle } from "lucide-react";
import { useProfile } from "@/hooks/auth/useProfile";
import { useLogout } from "@/hooks/auth/useLogout";
import { Button, Input } from "@/components/ui";

export const Header: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, loading: profileLoading } = useProfile();
  const { logout, loading: logoutLoading } = useLogout();

  // Get current search value from URL
  const searchQuery = searchParams.get('search') || '';

  // Get user name and email from profile data
  const userName = user?.name || user?.firstName || 'User';
  const userEmail = user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  // Determine dynamic placeholder based on current route
  const getSearchPlaceholder = () => {
    const path = pathname;
    if (path.startsWith('/customers')) return 'Search Customers...';
    if (path.startsWith('/items')) return 'Search Items...';
    if (path.startsWith('/invoices')) return 'Search Invoices...';
    if (path.startsWith('/templates')) return 'Search Templates...';
    if (path.startsWith('/payments')) return 'Search Payments...';
    if (path.startsWith('/expenses')) return 'Search Expenses...';
    if (path.startsWith('/reports')) return 'Search Reports...';
    if (path.startsWith('/time-tracking')) return 'Search Time Tracking...';
    return 'Search in Revolutic...';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams.toString());
    if (val) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    const query = newParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handleSignOut = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  const handleMyAccount = () => {
    setIsProfileOpen(false);
    router.push('/profile');
  };

  const handleQuickCreateClick = (path: string) => {
    setIsQuickCreateOpen(false);
    router.push(path);
  };

  const quickCreateSections = [
    {
      category: 'GENERAL',
      icon: LayoutGrid,
      items: [
        { label: 'Item', path: '/items/new' },
        { label: 'Invoice Template', path: '/templates/new' },
        { label: 'Log Time', path: '/time-tracking' },
      ],
    },
    {
      category: 'SALES',
      icon: ShoppingCart,
      items: [
        { label: 'Customer', path: '/customers/new' },
        { label: 'Invoices', path: '/invoices/new' },
        { label: 'Customer Payment', path: '/payments/new' },
      ],
    },
    {
      category: 'PURCHASES',
      icon: ShoppingBag,
      items: [
        { label: 'Expenses', path: '/expenses/new' },
      ],
    },
  ];

  return (
    <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2">
        {/* Search Bar */}
        <div className="flex items-center flex-1 min-w-0 max-w-md ml-0 md:ml-0">
          <Input
            type="text"
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={handleSearchChange}
            leftIcon={Search}
            inputSize="sm"
            variant="default"
            showLabel={false}
          />
        </div>

        {/* Action Controls: Plus Button & Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 ml-2">
          {/* Plus Button & Quick Create Popover */}
          <div className="relative">
            <Button
              variant="primary"
              size="xs"
              className="!p-2 shadow-xs cursor-pointer"
              icon={<Plus size={18} />}
              onClick={() => {
                setIsQuickCreateOpen(!isQuickCreateOpen);
                setIsProfileOpen(false);
              }}
            />

            {isQuickCreateOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsQuickCreateOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2.5 w-[92vw] sm:w-[620px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 z-20 animate-reveal">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {quickCreateSections.map((sec) => {
                      const CategoryIcon = sec.icon;
                      return (
                        <div key={sec.category} className="flex flex-col gap-2.5">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                            <CategoryIcon size={14} className="text-slate-400 shrink-0" />
                            <span>{sec.category}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {sec.items.map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                onClick={() => handleQuickCreateClick(item.path)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left group"
                              >
                                <PlusCircle size={14} className="text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Avatar & Dropdown */}
          <div className="relative">
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full cursor-pointer flex-shrink-0 hover:ring-2 hover:ring-primary transition-all flex items-center justify-center text-white font-semibold text-sm"
            >
              {profileLoading ? '...' : userInitial}
            </div>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  {/* Profile Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                          {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {profileLoading ? 'Loading...' : userName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {profileLoading ? '' : userEmail}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsProfileOpen(false)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer"
                      >
                        <X size={20} />
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
                      {logoutLoading ? 'Signing Out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
