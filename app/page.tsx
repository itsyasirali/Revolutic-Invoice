import React from "react";
import MarketingLayout from "@/components/landing/MarketingLayout";
import LandingPage from "@/components/landing/landing/LandingPage";
import { publicMeta } from "@/lib/pageMeta";

export const metadata = {
  ...publicMeta(
    "InvoiceSmarty - Invoicing, Payments & Time Tracking for Growing Businesses",
    "Create professional invoices and quotes, get paid faster, track time and expenses, and give your customers a self-service portal. Start free with InvoiceSmarty.",
    "/",
  ),
  title: { absolute: "InvoiceSmarty - Invoicing, Payments & Time Tracking for Growing Businesses" },
};


const HomePage = () => {
  return (
    <MarketingLayout>
      <LandingPage />
    </MarketingLayout>
  );
};

export default HomePage;
