/* eslint-disable @typescript-eslint/no-unused-vars */
 
"use client";

import React, { useState } from "react";
import faqs from "@/data/pricing/faqs";
import { Plus, Minus } from "lucide-react";
import Container from "@/components/layout/container";

const PricingFAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="max-w-3xl mx-auto mb-16 space-y-4 text-center">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Frequently asked questions
          </h2>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed pt-2">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-slate-200 pb-6">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between cursor-pointer py-2 text-left focus:outline-none group"
              >
                <span className="text-xl font-bold text-slate-900 pr-4 group-hover:text-primary transition-colors">
                  {faq.question}
                </span>
                <div className="shrink-0 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {openIdx === idx ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIdx === idx
                    ? "max-h-[500px] opacity-100 mt-4"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="pb-4 text-slate-600 leading-relaxed text-lg font-medium pr-12">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default PricingFAQ;
