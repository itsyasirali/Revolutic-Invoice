"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Globe, Mail, Phone, MapPin, Coins, ArrowRight, ShieldCheck, LogOut } from "lucide-react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "@/components/ui";

const CURRENCIES = [
  { code: "PKR", label: "PKR - Pakistani Rupee (Rs)" },
  { code: "USD", label: "USD - US Dollar ($)" },
  { code: "EUR", label: "EUR - Euro (€)" },
  { code: "GBP", label: "GBP - British Pound (£)" },
  { code: "CAD", label: "CAD - Canadian Dollar (C$)" },
  { code: "AUD", label: "AUD - Australian Dollar (A$)" },
  { code: "AED", label: "AED - UAE Dirham (د.إ)" },
  { code: "SAR", label: "SAR - Saudi Riyal (﷼)" },
];

const INDUSTRIES = [
  "Software & Technology",
  "Consulting & Professional Services",
  "Design, Agency & Media",
  "Retail & E-commerce",
  "Financial Services & Accounting",
  "Construction & Real Estate",
  "Healthcare & Wellness",
  "Manufacturing & Logistics",
  "Education & Training",
  "Other",
];

const OrganizationSetupPage: React.FC = () => {
  const router = useRouter();
  const { user, refetchProfile, logout } = useAuth();
  const { setOrganization } = useOrganization();

  const [name, setName] = useState(user?.companyName || "");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [currency, setCurrency] = useState("PKR");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your organization name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/organizations", {
        name: name.trim(),
        industry,
        currency,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        website: website.trim() || undefined,
      });

      const savedOrg = response.data?.organization;
      if (savedOrg) {
        setOrganization(savedOrg);
      }

      await refetchProfile({ silent: true });

      toast.success(
        `${name} has been set up successfully with a default invoice template.`,
        "Workspace Ready!"
      );

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create organization. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/70 to-blue-50/40 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            R
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Revolutic Invoice</h1>
            <p className="text-xs text-slate-500">Tenant Workspace Setup</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="max-w-2xl mx-auto w-full my-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10 transition-all">
          {/* Header Badge & Title */}
          <div className="text-center max-w-lg mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Step 1 of 1 — Create Your Organization</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Let&apos;s set up your business workspace
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Every organization in Revolutic has its own private data, customers, items, invoices, and payment records.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Organization Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Organization / Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corporation, Revolutic Studio"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Industry & Currency Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Industry / Business Type
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Base Currency
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
                  >
                    {CURRENCIES.map((cur) => (
                      <option key={cur.code} value={cur.code}>
                        {cur.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Business Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Email <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="billing@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Business Address <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Suite, City, State / Province, Postal Code"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium resize-none"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Website <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Value Props Note */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                By clicking <strong>Create &amp; Enter Workspace</strong>, a default invoice template and your isolated organization workspace will be initialized automatically.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Setting up your organization...</span>
                </>
              ) : (
                <>
                  <span>Create &amp; Enter Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 pt-6">
        &copy; {new Date().getFullYear()} Revolutic. All organization data is isolated and encrypted.
      </div>
    </div>
  );
};

export default OrganizationSetupPage;
