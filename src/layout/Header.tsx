import React, { useState } from 'react';
import { Search, Plus, ChevronDown, X, Bell, Settings as SettingsIcon } from 'lucide-react';
import { SettingsDrawer } from '../components/common/SettingsDrawer';
import { useProfile } from '../hooks/auth/useProfile';
import { useLogout } from '../hooks/auth/useLogout';


export const Header: React.FC = () => {
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { user, loading: profileLoading } = useProfile();
  const { logout, loading: logoutLoading } = useLogout();


  // Get user name and email from profile data
  const userName = user?.name || user?.firstName || 'User';
  const userEmail = user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  const handleMyAccount = () => {
    // Add my account navigation logic here
    console.log('My Account clicked');
  };



  return (
    <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5">
        <div className="flex items-center flex-1 min-w-0 max-w-xs  ml-0 md:ml-0">
          <div className={`flex items-center bg-gray-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 w-full transition-all ${isSearchFocused ? 'ring-2 ring-primary/50 bg-white' : ''
            }`}>
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search in Payments Received ( / )"
              className="flex-1 ml-2 outline-none text-xs sm:text-sm text-gray-700 placeholder-gray-400 bg-transparent"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-2">
          {/* Personal Dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsOrgOpen(!isOrgOpen)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Personal</span>
              <ChevronDown size={14} />
            </button>
            {isOrgOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsOrgOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                    Personal
                  </button>
                  <button className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                    Business
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Plus Button */}
          <button className="p-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors shadow-sm">
            <Plus size={18} />
          </button>

          {/* Notification Bell */}
          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings Icon with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <SettingsIcon size={20} />
            </button>
            {/* Settings Drawer */}
            <SettingsDrawer
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />
          </div>

          {/* Profile */}
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
                        onClick={() => setIsProfileOpen(false)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Profile Actions */}
                  <div className="py-2">
                    <button
                      onClick={handleMyAccount}
                      className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-gray-50 transition-colors"
                    >
                      My Account
                    </button>
                    <button
                      onClick={handleSignOut}
                      disabled={logoutLoading}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
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
