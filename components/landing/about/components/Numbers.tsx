import React from "react";
import Container from "@/components/layout/container";
import numbers from "@/data/about/numbers";

const Numbers = () => {
  return (
    <section className="py-32">
      <Container>
        <div className="mb-20 space-y-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl text-center">
            Our platform in numbers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {numbers.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white/50 backdrop-blur-sm shadow-sm border border-slate-100 rounded-xl p-10 flex flex-col justify-between min-h-[280px] hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300 shadow-sm border border-slate-100">
                <div className="h-5 w-5 bg-primary group-hover:bg-white rounded-sm rotate-45 transition-colors duration-300" />
              </div>

              <div className="mt-12">
                <div className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  {item.value}
                </div>
                <div className="text-base font-bold text-slate-600 leading-relaxed">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Numbers;
