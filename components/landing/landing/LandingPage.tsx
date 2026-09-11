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
import Button from "@/components/ui/Button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Client / Partner Marquee */}
      <Clients />

      {/* 3. Core Features Section */}
      <FeatureSection />

      {/* 4. How It Works Pipeline */}
      <HowItWorks />

      {/* 5. Team Solutions */}
      <Solutions />

      {/* 6. Industries Solutions Carousel */}
      <Industries />

      {/* 7. Testimonials */}
      <Testimonials />

      {/* 8. Bottom High-Converting CTA Banner */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
        <Container>
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 md:p-16 text-center text-white shadow-2xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Ready to transform your invoicing & billing?
              </h2>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Join thousands of businesses managing professional s, tracking
                payments, and getting paid faster with Revolutic .
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/30"
                  asChild
                >
                  <Link href="/demo" className="flex items-center gap-2">
                    <span>Book a Product Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-14 px-8 rounded-full border-slate-700 bg-white/10 text-white hover:bg-white/20 font-semibold text-base"
                  asChild
                >
                  <Link href="/pricing">View Pricing Plans</Link>
                </Button>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Setup in under 3 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;
