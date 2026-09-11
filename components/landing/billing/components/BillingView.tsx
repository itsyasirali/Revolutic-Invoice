"use client";

import React, { useState } from "react";
import { CreditCard, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import plans from "@/data/pricing/plans";

const BillingView = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Billing & Plans
          </h1>
          <p className="text-slate-500 text-sm">
            Manage your subscription, usage, and billing methods.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="md">Upgrade Plan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Current Plan Card */}
        <Card className="p-6 rounded-2xl border-slate-200 shadow-sm md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8" />

          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-slate-900">Pro Plan</h2>
                <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 py-0.5 text-[10px]">
                  ACTIVE
                </Badge>
              </div>
              <p className="text-sm text-slate-500 max-w-sm">
                You are currently on the Pro plan. Your next billing date is{" "}
                <strong className="text-slate-700 font-medium">
                  Aug 12, 2026
                </strong>
                .
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                $49
                <span className="text-sm text-slate-500 font-normal">/mo</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-700 font-medium">
                  Messages Sent
                </span>
                <span className="text-slate-900 font-mono text-xs font-semibold">
                  8,432 / 10,000
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[84%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-700 font-medium">
                  Campaign Sends
                </span>
                <span className="text-slate-900 font-mono text-xs font-semibold">
                  4 / 10
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[40%]" />
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Method Card */}
        <Card className="p-6 rounded-2xl border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Payment Method
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Manage how you pay for your plan.
          </p>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50 mb-4">
              <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Visa ending in 4242
                </div>
                <div className="text-xs text-slate-500">Expires 12/28</div>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Update Payment Method
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-3 bg-slate-50 p-1.5 rounded-full w-fit mx-auto border border-slate-200 shadow-sm mt-12 mb-20">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
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
    </div>
  );
};

export default BillingView;
