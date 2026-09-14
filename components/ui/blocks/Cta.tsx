import React from "react";
import Container from "@/components/layout/container";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Cta = () => {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 text-white shadow-2xl">
          <div className="absolute inset-0">
            {/* Dark gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/40 z-10" />
            <Image
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80"
              alt="Person managing invoices"
              fill
              className="object-cover object-right opacity-40"
              unoptimized={true}
            />
          </div>

          <div className="relative z-20 p-10 md:p-16 max-w-2xl space-y-6">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Scale your business <br className="hidden md:block" />
              with smart invoicing.
            </h2>
            <p className="text-slate-300 text-lg font-medium leading-relaxed">
              Create professional invoices, automate client billing, and track payments
              effortlessly with Revolutic Invoice.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="rounded-full h-14 px-8 font-semibold text-base shadow-lg shadow-primary/25"
                asChild
              >
                <Link href="/demo" className="flex items-center gap-2">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-full h-14 px-8 font-semibold text-base"
                asChild
              >
                <Link href="/pricing">View Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Cta;
