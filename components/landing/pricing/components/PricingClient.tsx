/* eslint-disable @typescript-eslint/no-unused-vars */
 
"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import plans from "@/data/pricing/plans";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/container";

const PricingClient = ({ isDashboard = true }: { isDashboard?: boolean }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-20">
      <Container className="text-center">
        {/* Hero Section */}
        <div className="mx-auto max-w-5xl space-y-8 mb-20">
          {!isDashboard && (
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
                All features Upfront <br />{" "}
                <span className="text-primary">simple pricing</span>
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-slate-600 md:text-xl font-semibold leading-relaxed">
                Try any plan free for 14 days. No credit card required.
              </p>
            </div>
          )}

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 bg-slate-50 p-1.5 rounded-full w-fit mx-auto border border-slate-200 shadow-sm mt-8">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full cursor-pointer text-base font-semibold transition-all ${
                !isAnnual
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full cursor-pointer text-base font-semibold transition-all flex items-center gap-2 ${
                isAnnual
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Annually{" "}
              <span className="bg-primary/10 text-primary text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative flex flex-col p-8 rounded-xl transition-all duration-300 ${
                plan.popular
                  ? "border-primary shadow-xl lg:-mt-6 lg:mb-6 z-10 bg-white hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 border-2"
                  : "bg-white/50 backdrop-blur-sm border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-sm">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {plan.name}
                </h3>
                <p className="text-base text-slate-600 font-medium min-h-[48px]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8 flex items-baseline">
                {plan.monthlyPrice === "Custom" ? (
                  <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                    Custom
                  </span>
                ) : (
                  <>
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-lg text-slate-500 ml-2 font-medium">
                      /mo
                    </span>
                  </>
                )}
              </div>

              <Button
                className="w-full mb-10 h-14 rounded-full font-bold text-base"
                variant={plan.buttonVariant === "outline" ? "outline" : "primary"}
                size="lg"
              >
                {plan.buttonText}
              </Button>

              <div className="space-y-5 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 shrink-0 bg-primary/10 p-1 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                    <span className="text-base font-medium text-slate-700 leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-xl p-10 md:p-14 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm">
          <div className="max-w-2xl text-center md:text-left space-y-3">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Large team or custom requirements?
            </h3>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Get a personalized onboarding experience, custom SLA, and volume
              discounts for your enterprise.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
            <Button
              className="rounded-full h-14 px-10 text-base font-semibold"
              size="lg"
            >
              Talk to sales
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PricingClient;
