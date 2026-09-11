import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import Hero from "@/components/landing/about/components/Hero";
import Story from "@/components/landing/about/components/Story";
import Numbers from "@/components/landing/about/components/Numbers";
import Reasons from "@/components/landing/about/components/Reasons";
import ActionCards from "@/components/landing/about/components/ActionCards";

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
