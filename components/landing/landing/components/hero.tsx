"use client";

import Container from "@/components/layout/container";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { X, Minus, Expand } from "lucide-react";
import DashboardMockup from "./DashboardMockup";

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      <Container className="text-center">
        <div className="mx-auto max-w-5xl space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
            Smart invoicing software for{" "}
            <span className="text-primary">your business.</span>
          </h1>

          <p className="mx-auto max-w-3xl text-lg text-slate-600 md:text-xl font-semibold leading-relaxed">
            Create professional invoices, track payments, and get paid faster.
            Manage customers, items and billing in one place, no accounting
            expertise required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base font-semibold h-14 px-8 rounded-full shadow-lg shadow-primary/20"
              asChild
            >
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base font-semibold h-14 px-8 rounded-full"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <p className="text-sm text-slate-700 pt-2">
            No credit card required. 14-day free trial.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-16 md:mt-24 relative mx-auto max-w-[90rem] text-left">
          <div className="rounded-xl border bg-white/50 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-slate-900/5">
            <div className="rounded-xl overflow-hidden border bg-slate-50">
              {/* Fake Browser Header */}
              <div className="flex h-10 items-center gap-2 border-b bg-white px-4">
                <div className="flex gap-1.5 group/window-controls">
                  <div className="h-3 w-3 rounded-full bg-red-400 flex items-center justify-center">
                    <X
                      className="h-2 w-2 text-red-900 opacity-60"
                      strokeWidth={3}
                    />
                  </div>
                  <div className="h-3 w-3 rounded-full bg-amber-400 flex items-center justify-center">
                    <Minus
                      className="h-2 w-2 text-amber-900 opacity-60"
                      strokeWidth={4}
                    />
                  </div>
                  <div className="h-3 w-3 rounded-full bg-green-400 flex items-center justify-center">
                    <Expand
                      className="h-2 w-2 text-green-900 opacity-60"
                      strokeWidth={3}
                    />
                  </div>
                </div>
                <div className="ml-4 flex h-6 flex-1 items-center rounded-md bg-slate-100 px-3 text-xs text-slate-400">
                  invoicesmarty.app
                </div>
              </div>

              {/* Mockup Content */}
              <div className="relative h-[460px] w-full overflow-hidden bg-white md:h-[680px]">
                <DashboardMockup />
                {/* soft fade at the bottom of the main area (not the sidebar): the dashboard continues below */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent lg:left-56" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
