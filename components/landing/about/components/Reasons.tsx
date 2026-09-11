import React from "react";
import Container from "@/components/layout/container";
import reasons from "@/data/about/reasons";

const Reasons = () => {
  return (
    <section className="py-24 ">
      <Container>
        <div className="mb-20 space-y-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl text-center">
            3 reasons for our platform
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <div
                key={idx}
                className="group border-slate-100 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 bg-white/50 backdrop-blur-sm rounded-xl p-10 border"
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                  <Icon
                    className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 pr-4 leading-snug">
                  {reason.title}
                </h3>
                <p className="text-base text-slate-600 leading-relaxed font-medium">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default Reasons;
