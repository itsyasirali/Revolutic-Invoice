import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import Hero from "@/components/landing/about/components/Hero";
import Story from "@/components/landing/about/components/Story";
import Numbers from "@/components/landing/about/components/Numbers";
import Reasons from "@/components/landing/about/components/Reasons";
import ActionCards from "@/components/landing/about/components/ActionCards";
import { publicMeta } from "@/lib/pageMeta";

export const metadata = publicMeta("About Us", "Learn about InvoiceSmarty, the team behind it and why businesses trust it for invoicing, payments and time tracking.", "/about");


const AboutPage = () => {
  return (
    <MarketingLayout>
      <div className="w-full">
        <Hero />
        <Story />
        <Numbers />
        <Reasons />
        <ActionCards />
      </div>
    </MarketingLayout>
  );
};

export default AboutPage;
