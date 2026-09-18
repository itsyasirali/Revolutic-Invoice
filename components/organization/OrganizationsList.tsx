"use client";

import React from "react";
import Image from "next/image";
import {
  Building2,
  Plus,
  Trash2,
  Briefcase,
  Coins,
  MapPin,
} from "lucide-react";
import { ConfirmDialog, LoadingSpinner } from "@/components/ui";
import useOrganizationsList from "@/hooks/organization/useOrganizationsList";
import {
  MAX_ORGANIZATIONS_PER_USER,
  ORGANIZATION_THEMES,
  getOrganizationTheme,
} from "@/types/organization";

export const THEMES = ORGANIZATION_THEMES;

export const OrganizationsList: React.FC = () => {
  const {
    organization,
    organizations,
    loading,
    deleteLoading,
    pendingDelete,
    handleOpenOrg,
    handleAddNew,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useOrganizationsList();

  const canAddMore = organizations.length < MAX_ORGANIZATIONS_PER_USER;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e3f1fe] via-[#f0f8fe] to-[#d9effd] flex items-center justify-center relative font-sans">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3f1fe] via-[#f0f8fe] to-[#d9effd] pb-8 relative font-sans">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <Image
                src="/assets/InvoiceSmartyIcon.png"
                alt="Invoice Smarty"
                width={28}
                height={28}
                className="w-10 h-10 object-contain rounded-md"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[14px] font-bold tracking-tight text-slate-700 uppercase">
                Invoice
              </span>
              <span className="text-[14px] font-extrabold tracking-tight text-primary">
                Smarty
              </span>
            </div>
            <div className="h-6 w-[1.5px] bg-slate-300 mx-1 sm:mx-2" />
            <span className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight">
              Organizations
            </span>
          </div>

          {canAddMore ? (
            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Organization
            </button>
          ) : (
            <span className="text-xs font-medium text-slate-500 shrink-0">
              Limit reached ({MAX_ORGANIZATIONS_PER_USER}/
              {MAX_ORGANIZATIONS_PER_USER})
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {organizations.map((org, index) => {
            const isActive = org.id === organization?.id;
            const theme = getOrganizationTheme(index);

            return (
              <div
                key={org.id}
                className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-md bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300 ${
                  isActive ? "ring-2 ring-primary/50" : "ring-1 ring-slate-100"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 font-bold text-xl text-white shadow-sm ${theme.avatar}`}
                >
                  {org.name?.charAt(0)?.toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {org.name}
                    </h3>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Selected
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 text-slate-600">
                      <MapPin className="w-3 h-3" />
                      {[org.stateProvince, org.businessLocation]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 ${theme.chip}`}
                    >
                      <Briefcase className="w-3 h-3" />
                      {org.industry || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 text-slate-600">
                      <Coins className="w-3 h-3" />
                      {org.currency || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenOrg(org)}
                    disabled={!org.slug}
                    className="inline-flex items-center justify-center h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Open Organization
                  </button>

                  <button
                    type="button"
                    onClick={() => requestDelete(org)}
                    disabled={isActive}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-300 disabled:hover:bg-transparent"
                    title={
                      isActive
                        ? "Switch to another organization before deleting this one"
                        : "Delete Organization"
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {organizations.length === 0 && (
          <div className="mt-10 text-center text-sm text-slate-500">
            No organizations found.
          </div>
        )}

        <ConfirmDialog
          isOpen={!!pendingDelete}
          title="Delete Organization"
          message={`Are you sure you want to delete "${pendingDelete?.name}"? This action cannot be undone.`}
          confirmText={deleteLoading ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </div>
    </div>
  );
};

export default OrganizationsList;
