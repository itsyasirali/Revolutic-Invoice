"use client";

import React from "react";
import Hero from "./components/hero";
import Clients from "./components/Clients";
import FeatureSection from "./components/feature-section";
import HowItWorks from "./components/how-it-works";
import Solutions from "./components/solutions";
import Industries from "./components/industries";
import Testimonials from "./components/testimonials";

const LandingPage = () => {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section */}
      <Hero />
      <HowItWorks />

      {/* 2. Client / Partner Marquee */}
      <Clients />

      {/* 3. Core Features Section */}
      <FeatureSection />

      {/* 4. How It Works Pipeline */}

      {/* 5. Team Solutions */}
      <Solutions />

      {/* 6. Industries Solutions Carousel */}
      <Industries />

      {/* 7. Testimonials */}
      <Testimonials />
    </div>
  );
};

export default LandingPage;
