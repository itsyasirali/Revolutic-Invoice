import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import BillingView from "@/components/landing/billing/components/BillingView";

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
