import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import Hero from "@/components/ui/blocks/Hero";
import List from "@/components/ui/blocks/List";
import Cta from "@/components/ui/blocks/Cta";
import Newsletter from "@/components/ui/blocks/Newsletter";
import posts from "@/data/blog/posts";
import blogCategories from "@/data/blog/categories";

const ResourcesPage = () => {
  const featured = posts.find((item) => item.featured) || posts[0];

  return (
    <MarketingLayout>
      <div className="w-full">
        <Hero
          title="Resources & Guides"
          subtitle="Finance, Invoicing & Automation Insights"
          featuredItem={featured}
          baseRoute="resources"
        />
        <List
          title="Latest Articles & Guides"
          description="Everything you need to know about scaling client billing, cash-flow optimization, and modern finance tools."
          items={posts}
          categories={blogCategories}
          baseRoute="resources"
        />
        <Cta />
        <Newsletter />
      </div>
    </MarketingLayout>
  );
};

export default ResourcesPage;
