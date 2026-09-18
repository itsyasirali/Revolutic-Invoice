"use client";

import React from "react";
import { ChevronDown, Plus, Sparkles, Settings } from "lucide-react";
import useOrganizationSwitcher from "@/hooks/organization/useOrganizationSwitcher";
import { ConfirmDialog, LoadingSpinner } from "@/components/ui";
import { MAX_ORGANIZATIONS_PER_USER } from "@/types/organization";

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
    handleAddNewOrg,
    handleManageOrgs,
    pendingOrg,
    confirmSwitch,
    cancelSwitch,
  } = useOrganizationSwitcher();

  if (!organization && !loading) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isSwitching}
        className="group flex items-center gap-2.5 px-3 py-1.5 sm:py-2 rounded-lg bg-primary hover:bg-primary/90 active:bg-primary/95 text-white shadow-xs transition-all duration-200 cursor-pointer select-none text-left disabled:opacity-70 disabled:cursor-not-allowed"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={organization?.name || "Select Organization"}
      >
        {/* Organization Character Avatar */}
        <div className="w-6 h-6 rounded-md bg-white text-primary flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs select-none">
          {organization?.name?.charAt(0)?.toUpperCase() || "O"}
        </div>

        {/* Organization Name */}
        <span className="text-xs sm:text-sm font-medium text-white truncate max-w-32.5 sm:max-w-42.5 leading-tight">
          {organization?.name || "Select Organization"}
        </span>

        {/* Chevron or Loader */}
        {isSwitching ? (
          <LoadingSpinner size="xs" color="white" />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-white/90 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header: SWITCH ORGANIZATION */}
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 pt-2 pb-1.5 select-none">
            SWITCH ORGANIZATION
          </div>

          {/* Organizations List */}
          <div className="max-h-60 overflow-y-auto space-y-1 dropdown-scrollbar py-0.5">
            {organizations.map((org) => {
              const isActive = org.id === organization?.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSelectOrg(org.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-left group ${
                    isActive
                      ? "bg-slate-100/90 white"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {/* Organization Character Avatar */}
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold transition-colors select-none ${
                        isActive
                          ? "bg-primary text-white shadow-2xs"
                          : "bg-slate-500 text-white group-hover:bg-slate-700"
                      }`}
                    >
                      {org.name?.charAt(0)?.toUpperCase() || "O"}
                    </div>
                    <span
                      className={`text-xs sm:text-[13px] truncate ${
                        isActive
                          ? "font-semibold text-slate-800"
                          : "font-normal text-slate-600 group-hover:text-slate-800"
                      }`}
                    >
                      {org.name}
                    </span>
                  </div>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 ml-2 shadow-2xs" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Divider & Add New Organization Button */}
          <div className="border-t border-slate-100 my-1 pt-1">
            {organizations.length < MAX_ORGANIZATIONS_PER_USER && (
              <button
                type="button"
                onClick={handleAddNewOrg}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors cursor-pointer group"
              >
                <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Add New Organization</span>
                <Sparkles className="w-3.5 h-3.5 text-primary/70 ml-auto opacity-70 group-hover:opacity-100" />
              </button>
            )}

            <button
              type="button"
              onClick={handleManageOrgs}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-200 transition-colors shrink-0">
                <Settings className="w-3.5 h-3.5" />
              </div>
              <span>Manage Organizations</span>
            </button>
          </div>
        </div>
      )}

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
