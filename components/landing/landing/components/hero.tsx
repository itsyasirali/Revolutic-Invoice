"use client";

import Container from "@/components/layout/container";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardMockup from "./DashboardMockup";

const Hero = () => {
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden pt-24 pb-0 md:pt-32">
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
              <Link href={user ? "/dashboard" : "/register"}>Access InvoiceSmarty</Link>
            </Button>
          </div>
        </div>

        {/* Dashboard mock-up in a device frame: thin metal edge, thick dark bezel, rounded screen */}
        <div className="mt-16 md:mt-24 relative mx-auto max-w-[90%] text-left">
          <div className="rounded-t-[20px] bg-neutral-900 p-2.5 pb-0 sm:rounded-t-[26px] md:rounded-t-[30px] sm:p-3.5 sm:pb-0 md:p-4 md:pb-0">
            <div className="relative h-[460px] w-full overflow-hidden rounded-t-[12px] bg-neutral-900 md:h-[680px]">
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
