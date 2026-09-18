"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, PlusCircle, ChevronUp, Star } from "lucide-react";
import { Input, Select, LoadingSpinner } from "@/components/ui";
import { useOrganizationSetup } from "@/hooks/organization/useOrganizationSetup";
import {
  INDUSTRIES,
  LOCATIONS,
  CURRENCIES,
  TIMEZONES,
} from "@/data/organizationSetupData";

export const OrganizationSetup: React.FC = () => {
  const {
    organizationName,
    setOrganizationName,
    industry,
    setIndustry,
    location,
    handleLocationChange,
    province,
    setProvince,
    provincesList,
    currency,
    setCurrency,
    timeZone,
    setTimeZone,
    showAddress,
    setShowAddress,
    streetAddress,
    setStreetAddress,
    city,
    setCity,
    zipCode,
    setZipCode,
    loading,
    error,
    userName,
    isAddingNewOrg,
    limitReached,
    handleSubmit,
    handleBack,
  } = useOrganizationSetup();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Atmosphere Background: Soft Glowing Aura */}
      <div className="w-125 h-125 rounded-full bg-primary/15 blur-3xl absolute -top-32 -right-32 pointer-events-none" />
      <div className="w-105 h-105 rounded-full bg-purple-300/25 blur-3xl absolute -bottom-32 -left-32 pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-170 bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden relative z-10">
        {/* Header Bar */}
        <div className="bg-[#f0f5fa] px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-slate-200/80">
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
              {isAddingNewOrg ? "New Organization" : "Organization Setup"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBack}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-1.5 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-9 space-y-5">
          {/* Greeting Section */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <span>
                {isAddingNewOrg
                  ? "Create a New Organization"
                  : `Welcome aboard, ${userName}!`}
              </span>
            </h1>
            <p className="text-sm text-slate-500">
              {isAddingNewOrg
                ? "Set up a separate business profile, currency, and address for this workspace."
                : "Enter your organization details to get started with Invoice Smarty."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Organization Name */}
          <Input
            label="Organization Name"
            placeholder="Organization Name"
            required
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            error={
              error && !organizationName.trim()
                ? "Organization Name is required"
                : undefined
            }
            autoFocus
            fullWidth
          />

          {/* Industry */}
          <Select
            label="Industry"
            required
            options={INDUSTRIES}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            fullWidth
            searchable
          />

          {/* Organization Location & State/Province Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Select
              label="Organization Location"
              required
              options={LOCATIONS}
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              fullWidth
              searchable
            />

            <Select
              label="State/Province"
              options={provincesList}
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              fullWidth
              searchable
            />
          </div>

          {/* Add Organization Address Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAddress((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            >
              {showAddress ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <PlusCircle className="w-4 h-4 stroke-[2.2]" />
              )}
              <span>
                {showAddress
                  ? "Hide Organization Address"
                  : "Add Organization Address"}
              </span>
            </button>

            {/* Expandable Address Inputs */}
            {showAddress && (
              <div className="mt-3 p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <Input
                  label="Street Address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. Office 402, Business Bay"
                  fullWidth
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi"
                    fullWidth
                  />
                  <Input
                    label="Postal / Zip Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="e.g. 54000"
                    fullWidth
                  />
                </div>
              </div>
            )}
          </div>

          {/* Currency & Time Zone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Select
              label="Currency"
              required
              options={CURRENCIES}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              fullWidth
              searchable
            />

            <Select
              label="Time Zone"
              required
              options={TIMEZONES}
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              fullWidth
              searchable
            />
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200/80 pt-2" />

          {/* Note Section */}
          <div className="space-y-2.5 text-[13px] text-slate-600">
            <p className="font-semibold text-slate-800 text-sm">Note:</p>
            <ul className="space-y-1.5 list-disc list-outside pl-4 leading-relaxed">
              <li>
                You can update some of these preferences from Settings anytime.
              </li>
              <li>
                Default preferences will be applied for the following features:
              </li>
            </ul>

            {/* Feature tags with amber stars */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-1 pl-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Email Templates</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Template Customizations</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Payment Modes</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200/80" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || limitReached}
                className="h-11 px-6 sm:px-7 rounded-md bg-primary hover:bg-primary/90 active:bg-primary/95 text-white font-medium text-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="xs" color="white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Create Organization"
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="h-11 px-5 sm:px-6 rounded-md bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingNewOrg ? "Back to Dashboard" : "Go Back"}
              </button>
            </div>

            <Link
              href="/privacy"
              className="text-slate-600 hover:text-slate-900 underline text-sm transition-colors self-center sm:self-auto"
            >
              Privacy Policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationSetup;
