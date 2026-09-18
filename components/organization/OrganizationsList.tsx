"use client";

import React from "react";
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
import { MAX_ORGANIZATIONS_PER_USER } from "@/types/organization";

const THEMES = [
  {
    accent: "bg-blue-500",
    avatar: "bg-blue-500",
    chip: "bg-blue-50 text-blue-600",
  },
  {
    accent: "bg-violet-500",
    avatar: "bg-violet-500",
    chip: "bg-violet-50 text-violet-600",
  },
  {
    accent: "bg-emerald-500",
    avatar: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-600",
  },
  {
    accent: "bg-amber-500",
    avatar: "bg-amber-500",
    chip: "bg-amber-50 text-amber-600",
  },
  {
    accent: "bg-pink-500",
    avatar: "bg-pink-500",
    chip: "bg-pink-50 text-pink-600",
  },
];

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 via-indigo-50/60 to-purple-50 pb-8 relative overflow-hidden">
      <div className="w-[420px] h-[420px] rounded-full bg-primary/25 blur-3xl absolute -top-40 -right-40 pointer-events-none" />
      <div className="w-[340px] h-[340px] rounded-full bg-purple-300/30 blur-3xl absolute -bottom-32 -left-32 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Organizations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              View, switch, or remove the organizations on your account.
            </p>
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
            const theme = THEMES[index % THEMES.length];

            return (
              <div
                key={org.id}
                className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300 ${
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
