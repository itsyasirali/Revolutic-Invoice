"use client";

import React from "react";
import { Building2, ChevronDown, Check, Plus, Sparkles } from "lucide-react";
import useOrganizationSwitcher from "@/hooks/organization/useOrganizationSwitcher";
import { LoadingSpinner } from "@/components/ui";

const OrganizationSwitcher: React.FC = () => {
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
  } = useOrganizationSwitcher();

  if (!organization && !loading) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isSwitching}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer select-none text-left ${
          isOpen
            ? "bg-blue-50/90 border-blue-300 ring-2 ring-blue-500/20 shadow-xs"
            : "bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-2xs"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={organization?.name || "Select Organization"}
      >
        <div className="w-6 h-6 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-primary shrink-0 group-hover:bg-blue-600/15 transition-colors">
          <Building2 className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>

        <div className="flex flex-col min-w-0 pr-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[130px] sm:max-w-[160px] leading-tight">
              {organization?.name || "Select Organization"}
            </span>
          </div>
          {organization?.currency && (
            <span className="text-[10px] font-medium text-slate-400 leading-tight">
              {organization.currency}
            </span>
          )}
        </div>

        {isSwitching ? (
          <LoadingSpinner size="xs" />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-150 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Organizations
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-primary rounded-full border border-blue-200/60">
                {organizations.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Switch workspace</span>
          </div>

          {/* Organizations List */}
          <div className="max-h-60 overflow-y-auto py-1 px-1.5 space-y-0.5">
            {organizations.map((org) => {
              const isActive = org.id === organization?.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSelectOrg(org.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-blue-50/80 text-primary font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isActive
                          ? "bg-primary text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}
                    >
                      {org.name?.charAt(0)?.toUpperCase() || "O"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate leading-snug">
                        {org.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                        {[org.currency, org.businessLocation || org.industry]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <div className="shrink-0 text-primary pl-1">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Action: Add New Organization */}
          <div className="pt-1 px-1.5 border-t border-slate-100 mt-1">
            <button
              type="button"
              onClick={handleAddNewOrg}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-primary hover:bg-blue-50/70 active:bg-blue-100 transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100/70 text-primary flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Add New Organization</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-400 ml-auto opacity-70 group-hover:opacity-100" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSwitcher;
