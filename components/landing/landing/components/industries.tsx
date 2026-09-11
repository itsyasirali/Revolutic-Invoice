"use client";

import * as React from "react";
import Container from "@/components/layout/container";
import { ArrowLeft, ArrowRight, ArrowRightIcon } from "lucide-react";
import industries from "@/data/industries/industries";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";

const Industries = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = React.useState(true);
  const [isAtEnd, setIsAtEnd] = React.useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Increased tolerance to 40px to account for CSS scroll-snap offsets
      setIsAtStart(scrollLeft <= 40);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 40);
    }
  };

  React.useEffect(() => {
    handleScroll();
    const timeout = setTimeout(handleScroll, 200);
    window.addEventListener("resize", handleScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 320;
      scrollRef.current.scrollBy({ left: -(cardWidth + 16), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 320;
      scrollRef.current.scrollBy({ left: cardWidth + 16, behavior: "smooth" });
    }
  };

  return (
    <section className="py-24">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="hidden md:block flex-1" />
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl shrink-0">
            One solution, perfect for every industry
          </h2>
          <div className="flex justify-center md:justify-end gap-4 flex-1">
            <Button
              variant="outline"
              size="md"
              onClick={scrollLeft}
              disabled={isAtStart}
              className={`h-12 w-12 !rounded-full border-slate-200 text-slate-900 transition-colors ${
                isAtStart
                  ? "!opacity-30 !cursor-not-allowed"
                  : "hover:bg-slate-50"
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={scrollRight}
              disabled={isAtEnd}
              className={`h-12 w-12 !rounded-full border-slate-200 text-slate-900 transition-colors ${
                isAtEnd
                  ? "!opacity-30 !cursor-not-allowed"
                  : "hover:bg-slate-50"
              }`}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
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
              className="min-w-[280px] md:min-w-[calc(33.333%-11px)] h-[450px] rounded-lg relative overflow-hidden group snap-start shrink-0 border-0 p-0"
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
