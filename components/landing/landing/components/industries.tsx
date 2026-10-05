"use client";

import Container from "@/components/layout/container";
import { ArrowLeft, ArrowRight, ArrowRightIcon } from "lucide-react";
import industries from "@/data/industries/industries";
import Card from "@/components/ui/Card";
import Link from "next/link";
import useIndustriesScroller from "@/hooks/landing/useIndustriesScroller";

const Industries = () => {
  const { scrollRef, isAtStart, isAtEnd, handleScroll, scrollLeft, scrollRight } =
    useIndustriesScroller();

  return (
    <section className="py-24">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="hidden md:block flex-1" />
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl shrink-0">
            One invoicing solution, perfect for every industry
          </h2>
          <div className="flex justify-center md:justify-end gap-4 flex-1">
            <button
              type="button"
              aria-label="Previous"
              onClick={scrollLeft}
              disabled={isAtStart}
              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 transition-colors hover:border-primary hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={scrollRight}
              disabled={isAtEnd}
              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 transition-colors hover:border-primary hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-900"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {industries.map((industry) => (
            <Card
              key={industry.id}
              className="min-w-[280px] md:min-w-[calc(33.333%-11px)] h-[500px] md:h-[540px] rounded-lg relative overflow-hidden group snap-start shrink-0 border-0 p-0"
              style={{
                backgroundImage: `url(${industry.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Gradient Overlay */}

              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end bg-slate-900/50 backdrop-blur-md border-t border-white/10">
                <h3 className="text-xl font-bold text-white mb-2">
                  {industry.title}
                </h3>
                <p className="text-slate-200 text-sm mb-4 line-clamp-3">
                  {industry.description}
                </p>
                <Link
                  href={"/industries/" + industry.slug}
                  className="inline-flex items-center text-sm font-semibold text-white hover:text-white/80 transition-colors mt-auto w-fit group-hover:gap-2 transition-all"
                >
                  Read more <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Industries;
