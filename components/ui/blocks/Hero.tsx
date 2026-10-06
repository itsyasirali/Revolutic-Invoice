import React from "react";
import Container from "@/components/layout/container";
import type { HeroProps } from "@/types/resource";

const Hero = ({ title, highlight, subtitle }: HeroProps) => {
  return (
    <section className="pt-24 pb-8 md:pt-32 relative overflow-hidden">
      <Container>
        <div className="mx-auto max-w-5xl space-y-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
            {title}{highlight && <> <span className="text-primary">{highlight}</span></>}
          </h1>
          {subtitle && (
            <p className="mx-auto max-w-3xl text-lg text-slate-600 md:text-xl font-semibold leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Hero;
