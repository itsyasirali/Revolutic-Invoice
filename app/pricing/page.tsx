import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import PricingClient from "@/components/landing/pricing/components/PricingClient";
import CompareTable from "@/components/landing/pricing/components/CompareTable";
import PricingAddons from "@/components/landing/pricing/components/PricingAddons";
import PricingFAQ from "@/components/landing/pricing/components/PricingFAQ";

const PricingPage = () => {
  return (
    <MarketingLayout>
      <div className="w-full">
        <PricingClient isDashboard={false} />
        <CompareTable />
        <PricingAddons />
        <PricingFAQ />
      </div>
    </MarketingLayout>
  );
};

export default PricingPage;
