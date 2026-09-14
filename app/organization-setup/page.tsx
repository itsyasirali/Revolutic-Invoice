"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, ChevronUp } from "lucide-react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "@/components/ui";

import SetupHeader from "./components/SetupHeader";
import SetupFormField from "./components/SetupFormField";
import SetupInput from "./components/SetupInput";
import SetupSelect from "./components/SetupSelect";
import SetupNotes from "./components/SetupNotes";
import SetupButtons from "./components/SetupButtons";

const INDUSTRIES = [
  "Web Development",
  "Software & Technology",
  "Consulting & Professional Services",
  "Design, Agency & Media",
  "Retail & E-commerce",
  "Financial Services & Accounting",
  "Construction & Real Estate",
  "Healthcare & Wellness",
  "Education & Training",
  "Other",
];

const LOCATIONS = [
  "Pakistan",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Saudi Arabia",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "Other",
];

const PROVINCES = [
  "State/Province",
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Kashmir",
  "Other",
];

const CURRENCIES = [
  { value: "PKR", label: "PKR - Pakistani Rupee" },
  { value: "USD", label: "USD - United States Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "AED", label: "AED - UAE Dirham" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
];

const LANGUAGES = ["English", "Urdu", "Arabic", "Spanish", "French", "German"];

const TIMEZONES = [
  "(GMT 5:00) Pakistan Time (Asia/Karachi)",
  "(GMT 0:00) Greenwich Mean Time (Europe/London)",
  "(GMT -5:00) Eastern Time (US & Canada)",
  "(GMT -8:00) Pacific Time (US & Canada)",
  "(GMT +4:00) Gulf Standard Time (Asia/Dubai)",
  "(GMT +3:00) Arabian Standard Time (Asia/Riyadh)",
  "(GMT +1:00) Central European Time (Europe/Paris)",
];

const OrganizationSetupPage: React.FC = () => {
  const router = useRouter();
  const { user, refetchProfile, logout } = useAuth();
  const { hasOrganization, refreshOrganizations, setOrganization } =
    useOrganization();

  const isAddingNewOrg = hasOrganization;

  // Form State
  const [organizationName, setOrganizationName] = useState(
    isAddingNewOrg ? "" : user?.companyName || "",
  );
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [province, setProvince] = useState(PROVINCES[0]);
  const [currency, setCurrency] = useState("PKR");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [timeZone, setTimeZone] = useState(TIMEZONES[0]);

  // Optional Address toggle & fields
  const [showAddress, setShowAddress] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userName = user?.firstName || user?.name?.split(" ")[0] || "there";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationName.trim()) {
      setError("Organization Name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullAddress = showAddress
        ? [
            streetAddress,
            city,
            province !== "State/Province" ? province : "",
            location,
            zipCode,
          ]
            .filter(Boolean)
            .join(", ")
        : location;

      const response = await axios.post("/organizations", {
        name: organizationName.trim(),
        industry,
        currency,
        address: fullAddress || undefined,
        businessLocation: location,
        stateProvince: province !== "State/Province" ? province : undefined,
        language,
        timeZone,
      });

      const savedOrg = response.data?.organization;
      if (savedOrg) {
        setOrganization(savedOrg);
      }

      await refreshOrganizations();
      await refetchProfile({ silent: true });

      toast.success(
        isAddingNewOrg
          ? `Organization "${organizationName}" has been created.`
          : `${organizationName} has been initialized successfully.`,
        isAddingNewOrg ? "Organization Created" : "Setup Complete",
      );

      // Reload dashboard so all active tenant data matches new organization
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to set up organization.",
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isAddingNewOrg) {
      router.push("/dashboard");
    } else {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7fd] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Soft Blue Atmospheric Gradient Circles */}
      <div className="w-[450px] h-[450px] rounded-full bg-blue-400/20 blur-3xl absolute -top-24 -right-24 pointer-events-none" />
      <div className="w-[380px] h-[380px] rounded-full bg-blue-300/25 blur-3xl absolute -bottom-24 -left-24 pointer-events-none" />

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
                : "Enter your organization details to get started with Zoho Invoice."}
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
              onClick={() => setShowAddress(!showAddress)}
              className="inline-flex items-center gap-1.5 text-sm text-[#2563eb] hover:text-primary font-medium transition-colors cursor-pointer"
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
