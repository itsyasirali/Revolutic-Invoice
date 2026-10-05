import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import BillingView from "@/components/landing/billing/components/BillingView";
import { publicMeta } from "@/lib/pageMeta";

export const metadata = publicMeta("Pricing & Plans", "Simple, transparent pricing for invoicing, quotes, payments, projects and time tracking. Pick the plan that fits your business.", "/billing");


const BillingPage = () => {
  return (
    <MarketingLayout>
      <div className="w-full">
        <BillingView />
      </div>
    </MarketingLayout>
  );
};

export default BillingPage;
