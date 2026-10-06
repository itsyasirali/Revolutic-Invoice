import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import Hero from "@/components/ui/blocks/Hero";
import List from "@/components/ui/blocks/List";
import industries from "@/data/industries/industries";
import industryCategories from "@/data/industries/categories";
import { publicMeta } from "@/lib/pageMeta";

export const metadata = publicMeta("Industries", "See how InvoiceSmarty fits your industry, from professional services to real estate and beyond.", "/industries");


const IndustriesPage = () => {
  return (
    <MarketingLayout>
      <div className="w-full">
        <Hero
          title="Smart invoicing solutions for"
          highlight="your industry."
          subtitle="Create professional invoices, track payments, and get paid faster. Tailored billing for every industry, no accounting expertise required."
        />
        <List
          title="All Industries"
          description="Explore tailored invoicing, billing automation, and client communication for your specific vertical."
          items={industries}
          categories={industryCategories}
          baseRoute="industries"
        />
      </div>
    </MarketingLayout>
  );
};

export default IndustriesPage;
