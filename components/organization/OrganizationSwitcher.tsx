"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Settings, X, Copy, Check } from "lucide-react";
import useOrganizationSwitcher from "@/hooks/organization/useOrganizationSwitcher";
import { ConfirmDialog, LoadingSpinner, toast } from "@/components/ui";
import { getOrganizationTheme } from "@/types/organization";

export const OrganizationSwitcher: React.FC = () => {
  const {
    organization,
    organizations,
    loading,
    isSwitching,
    isOpen,
    dropdownRef,
    setIsOpen,
    handleSelectOrg,
    handleManageOrgs,
    pendingOrg,
    confirmSwitch,
    cancelSwitch,
  } = useOrganizationSwitcher();

  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!organization && !loading) {
    return null;
  }

  const handleCopyId = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    toast.success("Organization ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isSwitching}
        className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 font-medium text-sm transition-colors cursor-pointer select-none text-left disabled:opacity-70 disabled:cursor-not-allowed"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={organization?.name || "Select Organization"}
      >
        <span className="text-sm font-medium text-slate-800 truncate max-w-32.5 sm:max-w-44 leading-tight">
          {organization?.name || "Select Organization"}
        </span>

        {isSwitching ? (
          <LoadingSpinner size="xs" color="gray" />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Portal to document.body so the backdrop covers and blurs the entire viewport including the sidebar */}
      {mounted &&
        createPortal(
          <>
            {/* Backdrop Overlay */}
            <div
              className={`fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60] transition-opacity duration-300 ease-in-out ${
                isOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setIsOpen(false)}
              aria-hidden={!isOpen}
            />

            {/* Full-Height Right Slide-Over Drawer (0 space from top and right) */}
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
              aria-label="Organizations"
            >
              {/* Header Row: Organizations | Manage | Close */}
              <div className="bg-[#f8fafc] px-5 py-4 border-b border-slate-200/80 flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold text-slate-900">Organizations</h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      handleManageOrgs();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-50 active:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Manage</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Subheading: My Organizations */}
              <div className="bg-white px-5 py-3.5 border-b border-slate-100 text-xs font-bold text-slate-900 select-none shrink-0">
                My Organizations
              </div>

              {/* Organizations List */}
              <div className="flex-1 overflow-y-auto dropdown-scrollbar">
                {organizations.map((org, index) => {
                  const isActive = org.id === organization?.id;
                  const theme = getOrganizationTheme(index);

                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => handleSelectOrg(org.id)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-slate-100/80 transition-colors cursor-pointer text-left group ${
                        isActive
                          ? "bg-slate-50/50"
                          : "hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        {/* Organization Avatar Box with Theme Background Color and First Letter */}
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-base font-bold text-white shadow-xs ${theme.avatar}`}
                        >
                          {org.name?.charAt(0)?.toUpperCase() || "O"}
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate leading-tight">
                            {org.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-normal mt-1">
                            <span>Organization ID: {org.id}</span>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => handleCopyId(e, org.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  handleCopyId(e as any, org.id);
                                }
                              }}
                              title="Copy Organization ID"
                              className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer inline-flex items-center"
                            >
                              {copiedId === org.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Active Indicator Checkmark Circle */}
                      {isActive && (
                        <div
                          className={`w-5 h-5 rounded-full ${theme.avatar} flex items-center justify-center text-white shrink-0 shadow-xs`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>,
          document.body
        )}

      {/* Confirmation Dialog on Org Switch */}
      {pendingOrg && (
        <ConfirmDialog
          isOpen
          type="info"
          title="Switch Organization"
          message={`Switch your active organization to "${pendingOrg.name}"?`}
          confirmText="Switch Organization"
          cancelText="Cancel"
          onConfirm={confirmSwitch}
          onCancel={cancelSwitch}
        />
      )}
    </div>
  );
};

export default OrganizationSwitcher;
