import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import Hero from "@/components/ui/blocks/Hero";
import List from "@/components/ui/blocks/List";
import Cta from "@/components/ui/blocks/Cta";
import Newsletter from "@/components/ui/blocks/Newsletter";
import industries from "@/data/industries/industries";
import industryCategories from "@/data/industries/categories";

const IndustriesPage = () => {
  const featured = industries.find((item) => item.featured) || industries[0];

  return (
    <MarketingLayout>
      <div className="w-full">
        <Hero
          title="Industry Solutions"
          subtitle="Tailored for Your Business"
          featuredItem={featured}
          baseRoute="industries"
        />
        <List
          title="All Industries"
          description="Explore tailored invoicing, billing automation, and client communication for your specific vertical."
          items={industries}
          categories={industryCategories}
          baseRoute="industries"
        />
        <Cta />
        <Newsletter />
      </div>
    </MarketingLayout>
  );
};

export default IndustriesPage;
