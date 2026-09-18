import React from "react";
import Container from "@/components/layout/container";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HeroProps } from "@/types/resource";

const Hero = ({ title, subtitle, featuredItem, baseRoute }: HeroProps) => {
  return (
    <section className="pt-32 pb-16 relative overflow-hidden">
      <Container>
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-20">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-slate-600 font-medium leading-relaxed uppercase tracking-wider text-sm">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href={`/${baseRoute}/${featuredItem.slug}`}
          className="block group"
        >
          <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="p-10 md:p-14 space-y-6">
                <div className="text-xs font-bold text-primary uppercase tracking-widest">
                  {featuredItem.category}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">
                  {featuredItem.title}
                </h2>
                <p className="text-slate-600 text-lg font-medium leading-relaxed">
                  {featuredItem.description}
                </p>
                <div className="flex items-center gap-2 font-semibold text-slate-900 mt-8 group-hover:text-primary transition-colors">
                  Read more{" "}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="relative h-full min-h-[300px] w-full bg-slate-100">
                <Image
                  src={featuredItem.image}
                  alt={featuredItem.title}
                  fill
                  className="object-cover"
                  unoptimized={true}
                  priority
                />
              </div>
            </div>
          </div>
        </Link>
      </Container>
    </section>
  );
};

export default Hero;
