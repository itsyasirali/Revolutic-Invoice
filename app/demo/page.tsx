import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import DemoSection from "@/components/landing/demo/components/demo-section";

const DemoPage = () => {
  return (
    <MarketingLayout>
      <div className="w-full">
        <DemoSection />
      </div>
    </MarketingLayout>
  );
};

export default DemoPage;
