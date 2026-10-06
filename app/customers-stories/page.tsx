import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import Hero from "@/components/ui/blocks/Hero";
import List from "@/components/ui/blocks/List";
import Cta from "@/components/ui/blocks/Cta";
import Newsletter from "@/components/ui/blocks/Newsletter";
import customers from "@/data/customers/customers";
import { publicMeta } from "@/lib/pageMeta";

export const metadata = publicMeta("Customer Stories", "Real stories from businesses that use InvoiceSmarty to bill clients and get paid on time.", "/customers-stories");


const customerCategories = [
  "All",
  ...Array.from(new Set(customers.map((c) => c.category))),
];

const CustomerStoriesPage = () => {
  return (
    <MarketingLayout>
      <div className="w-full">
        <Hero
          title="Real results from"
          highlight="growing businesses."
          subtitle="See how teams use InvoiceSmarty to create invoices, cut collection time and get paid faster. Honest stories from businesses just like yours."
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
