"use client";

import Container from "@/components/layout/container";
import Button from "@/components/ui/Button";
import Link from "next/link";
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

        {/* Dashboard mock-up in a device frame: thin metal edge, thick dark bezel, rounded screen */}
        <div className="mt-16 md:mt-24 relative mx-auto max-w-[90rem] text-left">
          <div className="rounded-[1.75rem] border border-slate-300 bg-neutral-900 p-2.5 shadow-2xl shadow-slate-900/25 ring-1 ring-slate-900/10 sm:rounded-[2.5rem] sm:p-3.5 md:p-4">
            <div className="relative h-[460px] w-full overflow-hidden rounded-[1.1rem] bg-white sm:rounded-[1.6rem] md:h-[680px]">
              <DashboardMockup />
              {/* soft fade at the bottom of the main area (not the sidebar): the dashboard continues below */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent lg:left-56" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
