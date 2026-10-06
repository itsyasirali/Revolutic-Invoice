import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import Hero from "@/components/ui/blocks/Hero";
import List from "@/components/ui/blocks/List";
import posts from "@/data/blog/posts";
import blogCategories from "@/data/blog/categories";
import { publicMeta } from "@/lib/pageMeta";

export const metadata = publicMeta("Resources", "Guides and articles on invoicing, getting paid faster, cash flow and modern finance tools.", "/resources");


const ResourcesPage = () => {
  return (
    <MarketingLayout>
      <div className="w-full">
        <Hero
          title="Invoicing guides and insights for"
          highlight="your business."
          subtitle="Learn how to get paid faster, manage cash flow and automate billing. Practical guides, tips and strategies to run a more organized business."
        />
        <List
          title="Latest Articles & Guides"
          description="Everything you need to know about scaling client billing, cash-flow optimization, and modern finance tools."
          items={posts}
          categories={blogCategories}
          baseRoute="resources"
        />
      </div>
    </MarketingLayout>
  );
};

export default ResourcesPage;
