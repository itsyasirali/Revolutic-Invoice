"use client";

import { useRef } from "react";
import Container from "@/components/layout/container";
import { Check, ChevronDown } from "lucide-react";
import { solutionData, solutionTabs } from "@/data/landing/solutionData";
import useSolutionsTabs from "@/hooks/landing/useSolutionsTabs";

const Solutions = () => {
  const { activeTab, setActiveTab } = useSolutionsTabs();
  // small delay so rows sliding open/closed under the pointer don't cause flicker
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const hoverTab = (tab: (typeof solutionTabs)[number]) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveTab(tab), 120);
  };

  return (
    <section className="py-24">
      <Container>
        <div className="text-center max-w-5xl mx-auto mb-12">
          <h2 className="text-center text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            The perfect invoicing solution for every team
          </h2>
        </div>

        <div>
          {/* Left: teams. Hovering (or tapping) one opens its details and updates the tiles. */}
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {solutionTabs.map((tab) => {
              const open = tab === activeTab;
              const data = solutionData[tab];
              return (
                <div
                  key={tab}
                  onMouseEnter={() => hoverTab(tab)}
                  onMouseLeave={() => clearTimeout(hoverTimer.current)}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    aria-expanded={open}
                    className="flex w-full cursor-pointer items-center justify-between py-5 text-left"
                  >
                    <span
                      className={`text-2xl font-bold tracking-tight transition-colors ${open ? "text-primary" : "text-slate-900"}`}
                    >
                      {tab}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="grid gap-8 pb-8 md:grid-cols-2 md:gap-16">
                        <div>
                          <h3 className="mb-3 text-xl font-semibold leading-snug text-slate-900">
                            {data.title}
                          </h3>
                          <p className="mb-5 leading-relaxed text-slate-600">
                            {data.description}
                          </p>
                          <ul className="mb-5 space-y-3">
                            {data.benefits.map((item) => (
                              <li key={item} className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                </span>
                                <span className="font-medium text-slate-700">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <figure className="border-l-4 border-primary pl-4">
                            <blockquote className="text-sm font-medium leading-relaxed text-slate-800">
                              &quot;{data.testimonial.quote}&quot;
                            </blockquote>
                            <figcaption className="mt-2 text-sm">
                              <span className="font-bold text-slate-900">
                                {data.testimonial.author}
                              </span>{" "}
                              <span className="text-slate-500">
                                {data.testimonial.company}
                              </span>
                            </figcaption>
                          </figure>
                        </div>
                        <ul className="space-y-4 self-center">
                          {data.features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                              <li
                                key={feature.text}
                                className="flex items-center gap-4"
                              >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                                  <Icon className="h-5 w-5" />
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {feature.text}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Solutions;
