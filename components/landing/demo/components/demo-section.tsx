/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import Container from "@/components/layout/container";
import useDemo from "@/components/landing/demo/hooks/use-demo";
import { Check, ShieldCheck, MapPin } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const EXPERT_AVATARS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80",
];

const DEMO_CHECKLIST = [
  "Let's determine your company's needs together",
  "Presenting the ideal AgentChat features",
  "Let's address your questions and explore next steps",
];

const DemoSection = () => {
  const {
    formData,
    loading,
    success,
    error,
    handleChange,
    handlePhoneNumberChange,
    submitForm,
    setSelectedCountryCode,
    selectedCountry,
    isCountryDropdownOpen,
    setIsCountryDropdownOpen,
    countrySearch,
    setCountrySearch,
    filteredCountries,
    isCompanySizeDropdownOpen,
    setIsCompanySizeDropdownOpen,
    handleCompanySizeChange,
  } = useDemo();

  return (
    <section className="py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Copy & Trust Signals */}
          <div className="space-y-10">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                Book a product demo now
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                Share a bit about your company and book a meeting with a
                AgentChat expert. Discover how our product can transform your
                business and get all your questions answered.
              </p>
            </div>

            {/* Avatars */}
            <div className="flex -space-x-3">
              {EXPERT_AVATARS.map((src, i) => (
                <div
                  key={i}
                  className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm"
                >
                  <Image
                    src={src}
                    alt="Expert avatar"
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Checklist */}
            <div className="space-y-4">
              <p className="font-semibold text-slate-900">In the demo:</p>
              <ul className="space-y-3">
                {DEMO_CHECKLIST.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className="text-[#0064e0] font-bold text-lg flex items-center">
                  <span className="text-2xl mr-1">∞</span> Meta
                </div>
                <div className="text-[10px] leading-tight font-medium text-slate-600">
                  Business
                  <br />
                  Partner
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center border border-yellow-200">
                  <ShieldCheck className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  GDPR
                  <br />
                  <span className="font-normal text-slate-500 text-[10px]">
                    compliant
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                  <MapPin className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Server location
                  <br />
                  <span className="font-normal text-slate-500">Pakistan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/20 blur-[100px] rounded-full pointer-events-none -z-10" />

            <Card className="rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitForm();
                }}
              >
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Alex Rivera"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Revolutic"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                  />
                </div>
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">
                    E-mail (business)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="e.g. alex@revolutic.com"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">
                    Country
                  </label>
                  <div className="relative">
                    <div
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary bg-white cursor-pointer flex justify-between items-center"
                      onClick={() =>
                        setIsCountryDropdownOpen(!isCountryDropdownOpen)
                      }
                    >
                      <span className="text-slate-900">
                        {selectedCountry.code} {selectedCountry.name}
                      </span>
                      <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-slate-400 shrink-0 ml-2"
                      >
                        <path
                          d="M1 1L5 5L9 1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {isCountryDropdownOpen && (
                      <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-50 text-left flex flex-col">
                        <div className="p-2 sticky top-0 bg-white border-b border-slate-100 z-10">
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((c) => (
                              <div
                                key={c.code}
                                className="px-4 py-2 hover:bg-primary hover:text-white cursor-pointer text-sm text-slate-700 transition-colors"
                                onClick={() => {
                                  setSelectedCountryCode(c.code);
                                  setIsCountryDropdownOpen(false);
                                  setCountrySearch("");
                                }}
                              >
                                {c.code} {c.name}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center">
                              No countries found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">
                    Phone number
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary bg-white">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-l-lg border-r border-slate-200 text-sm font-medium text-slate-700 shrink-0">
                      <span>
                        {selectedCountry.code} {selectedCountry.dial_code}
                      </span>
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handlePhoneNumberChange(e.target.value)}
                      required
                      placeholder="e.g. 555 123 4567"
                      className="w-full px-4 py-3 rounded-r-lg text-sm focus:outline-none placeholder:text-slate-400 bg-transparent"
                    />
                  </div>
                </div>

                {/* Company Size */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">
                    Company size
                  </label>
                  <div className="relative">
                    <div
                      className={`w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary bg-white cursor-pointer flex justify-between items-center ${
                        formData.companySize ? "text-slate-900" : "text-slate-400"
                      }`}
                      onClick={() => setIsCompanySizeDropdownOpen(!isCompanySizeDropdownOpen)}
                    >
                      <span>
                        {formData.companySize
                          ? `${formData.companySize} employees`
                          : "Please choose..."}
                      </span>
                      <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-slate-400 shrink-0 ml-2"
                      >
                        <path
                          d="M1 1L5 5L9 1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {isCompanySizeDropdownOpen && (
                      <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-50 text-left flex flex-col">
                        <div className="flex-1 overflow-y-auto py-1">
                          {["1-10", "11-50", "51-200", "201+"].map((size) => (
                            <div
                              key={size}
                              className="px-4 py-2 hover:bg-primary hover:text-white cursor-pointer text-sm text-slate-700 transition-colors"
                              onClick={() => handleCompanySizeChange(size)}
                            >
                              {size} employees
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-md shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? "Booking..." : "Book demo"}
                  </Button>
                </div>
              </form>
              {success && (
                <div className="mt-6 p-4 bg-primary/10 border border-primary/10 rounded-lg text-primary text-center text-sm">
                  Thank you! Your demo request has been submitted successfully.
                </div>
              )}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default DemoSection;
