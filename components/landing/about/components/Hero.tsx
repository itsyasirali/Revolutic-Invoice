import React from "react";
import Container from "@/components/layout/container";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="pt-32 pb-12 border-b border-slate-100 relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <Container className="text-center">
        <div className="mx-auto max-w-5xl space-y-8 mb-16 relative z-10">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
            Redefining how visionary brands connect with{" "}
            <span className="text-primary">their audience.</span>
          </h1>

          <p className="mx-auto max-w-3xl text-lg text-slate-600 md:text-xl font-semibold leading-relaxed">
            It all started when our founder realized that people and businesses
            communicate completely differently. We give businesses the tools to
            communicate as easily as people do.
          </p>
        </div>

        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden mt-16 shadow-2xl border border-slate-200">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80"
            alt="AgentChat team event"
            fill
            className="object-cover"
            unoptimized={true}
          />
        </div>
      </Container>
    </section>
  );
};

export default Hero;
