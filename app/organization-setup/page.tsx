"use client";

import React from "react";
import { PlusCircle, ChevronUp } from "lucide-react";
import { useOrganizationSetup } from "@/hooks/organization/useOrganizationSetup";
import {
  INDUSTRIES,
  LOCATIONS,
  PROVINCES,
  CURRENCIES,
  LANGUAGES,
  TIMEZONES,
} from "@/data/organizationSetupData";
import SetupHeader from "./components/SetupHeader";
import SetupFormField from "./components/SetupFormField";
import SetupInput from "./components/SetupInput";
import SetupSelect from "./components/SetupSelect";
import SetupNotes from "./components/SetupNotes";
import SetupButtons from "./components/SetupButtons";

const OrganizationSetupPage: React.FC = () => {
  const {
    organizationName,
    setOrganizationName,
    industry,
    setIndustry,
    location,
    setLocation,
    province,
    setProvince,
    currency,
    setCurrency,
    language,
    setLanguage,
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
    handleSubmit,
    handleBack,
  } = useOrganizationSetup();

  return (
    <div className="min-h-screen bg-[#f3f7fd] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Atmosphere Background: Soft Glowing Aura + Crisp Corner Circles + Ambient Vertical Lines */}
      <div className="w-125 h-125 rounded-full bg-primary/20 blur-3xl absolute -top-32 -right-32 pointer-events-none" />
      <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-primary absolute -top-20 -right-20 pointer-events-none opacity-90 shadow-2xl shadow-primary/30" />
      <div className="w-72 h-72 rounded-full bg-primary/20 absolute -top-24 -right-24 pointer-events-none" />

      <div className="w-105 h-105 rounded-full bg-primary/15 blur-3xl absolute -bottom-32 -left-32 pointer-events-none" />
      <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-primary absolute -bottom-20 -left-20 pointer-events-none opacity-90 shadow-2xl shadow-primary/30" />
      <div className="w-64 h-64 rounded-full bg-primary/20 absolute -bottom-24 -left-24 pointer-events-none" />

      {/* Subtle Vertical Atmospheric Grid Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-around opacity-40">
        <div className="w-[1px] h-full bg-slate-200" />
        <div className="w-[1px] h-full bg-slate-200" />
        <div className="w-[1px] h-full bg-slate-200" />
        <div className="w-[1px] h-full bg-slate-200" />
        <div className="w-[1px] h-full bg-slate-200" />
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-[680px] bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden relative z-10">
        {/* Header Bar */}
        <SetupHeader
          brandName="Invoice"
          subBrand="Smarty"
          title={isAddingNewOrg ? "New Organization" : "Organization Setup"}
          onClose={handleBack}
        />

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
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Organization Name */}
          <SetupFormField
            label="Organization Name"
            required
            error={
              error && !organizationName.trim()
                ? "Organization Name is required"
                : undefined
            }
          >
            <SetupInput
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder=""
              required
              autoFocus
            />
          </SetupFormField>

          {/* Industry */}
          <SetupFormField label="Industry" required>
            <SetupSelect
              options={INDUSTRIES}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </SetupFormField>

          {/* Organization Location & State/Province Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <SetupFormField label="Organization Location" required>
              <SetupSelect
                options={LOCATIONS}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </SetupFormField>

            <SetupFormField label="State/Province">
              <SetupSelect
                options={PROVINCES}
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </SetupFormField>
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
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Street Address
                  </label>
                  <SetupInput
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. Office 402, Business Bay"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      City
                    </label>
                    <SetupInput
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lahore, Karachi"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Postal / Zip Code
                    </label>
                    <SetupInput
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="e.g. 54000"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Currency & Language Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <SetupFormField label="Currency" required>
              <SetupSelect
                options={CURRENCIES}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </SetupFormField>

            <SetupFormField label="Language" required>
              <SetupSelect
                options={LANGUAGES}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </SetupFormField>
          </div>

          {/* Time Zone */}
          <SetupFormField label="Time Zone" required>
            <SetupSelect
              options={TIMEZONES}
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
            />
          </SetupFormField>

          {/* Divider */}
          <div className="border-t border-slate-200/80 pt-2" />

          {/* Note Section */}
          <SetupNotes />

          {/* Divider */}
          <div className="border-t border-slate-200/80" />

          {/* Action Buttons */}
          <SetupButtons
            loading={loading}
            onBack={handleBack}
            submitText={isAddingNewOrg ? "Create Organization" : "Get Started"}
            backText={isAddingNewOrg ? "Back to Dashboard" : "Go Back"}
          />
        </form>
      </div>
    </div>
  );
};

export default OrganizationSetupPage;
