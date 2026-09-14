import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import Hero from "@/components/ui/blocks/Hero";
import List from "@/components/ui/blocks/List";
import Cta from "@/components/ui/blocks/Cta";
import Newsletter from "@/components/ui/blocks/Newsletter";
import customers from "@/data/customers/customers";

const customerCategories = [
  "All",
  ...Array.from(new Set(customers.map((c) => c.category))),
];

const CustomerStoriesPage = () => {
  const featured = customers.find((item) => item.featured) || customers[0];

  return (
    <MarketingLayout>
      <div className="w-full">
        <Hero
          title="Customer Stories"
          subtitle="Real Results from Growing Teams"
          featuredItem={featured}
          baseRoute="customers-stories"
        />
        <List
          title="Case Studies & Success Stories"
          description="Discover how businesses streamline their billing operations and accelerate payments with our platform."
          items={customers}
          categories={customerCategories}
          baseRoute="customers-stories"
        />
        <Cta />
        <Newsletter />
      </div>
    </MarketingLayout>
  );
};

export default CustomerStoriesPage;
