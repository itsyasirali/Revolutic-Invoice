"use client";

import React from "react";
import Link from "next/link";
import Hero from "./components/hero";
import Clients from "./components/Clients";
import FeatureSection from "./components/feature-section";
import HowItWorks from "./components/how-it-works";
import Solutions from "./components/solutions";
import Industries from "./components/industries";
import Testimonials from "./components/testimonials";
import Container from "@/components/layout/container";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight } from "lucide-react";

const LandingPage = () => {
  const { user } = useAuth();
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

      {/* 8. Bottom CTA Banner */}
      <section className="py-16">
        <Container>
          <div className="rounded-md bg-primary px-6 py-14 text-center text-white md:py-16">
            <h2 className="mx-auto max-w-6xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Invoicing That Gets You Paid Faster.
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={user ? "/dashboard" : "/register"}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-7 text-sm font-semibold text-primary transition-colors hover:bg-slate-100 sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="inline-flex h-12 w-full items-center justify-center rounded-md border border-white/40 bg-white/10 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;
