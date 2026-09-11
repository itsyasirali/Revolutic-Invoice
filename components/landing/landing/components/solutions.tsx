"use client";

import * as React from "react";
import Container from "@/components/layout/container";
import Button from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

import { solutionData, solutionTabs, SolutionTab } from "@/data/landing/solutionData";;

const Solutions = () => {
  const [activeTab, setActiveTab] = React.useState<SolutionTab>("Sales");

  const currentData = solutionData[activeTab];

  return (
    <section className="py-24">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            The perfect solution for every team
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {solutionTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 cursor-pointer rounded-md text-md font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-slate-700 hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-sm bg-white w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div>
                <h3 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                  {currentData.title}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {currentData.description}
                </p>
              </div>

              <ul className="space-y-4">
                {currentData.benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2
                      className="h-6 w-6 text-primary shrink-0"
                      fill="#e6f6ff"
                      strokeWidth={1.5}
                    />
                    <span className="text-slate-600 font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-8 flex items-start gap-4 border-t border-slate-100 mt-8">
                <div>
                  <p className="text-slate-900 font-semibold text-sm mb-2 leading-snug">
                    &quot;{currentData.testimonial.quote}&quot;
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-slate-900">
                      {currentData.testimonial.author}
                    </span>{" "}
                    <span className="text-slate-500">
                      {currentData.testimonial.company}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="bg-[#f4f5f7] rounded-[1.5rem] p-6 md:p-10 flex flex-col items-center">
              <div className="w-full space-y-3 mb-10">
                {currentData.features.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white border border-slate-100 rounded-lg p-4 flex items-center gap-4 shadow-sm"
                    >
                      <div className="h-8 w-8 rounded-md bg-[#f0f7ff] flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-slate-600 text-sm font-medium">
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Button
                size="lg"
                className="bg-primary hover:bg-primary-light text-white px-8 rounded-lg font-semibold flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                Use this solution
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Solutions;
