import React from "react";
import compareTableFeatures from "@/data/pricing/compareTableFeatures";
import { Check, Minus } from "lucide-react";
import Container from "@/components/layout/container";

const CompareTable = () => {
  return (
    <section className="py-24 md:py-32 bg-white">
      <Container>
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Find the plan that suits you
          </h2>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed pt-2">
            Compare features across our pricing tiers
          </p>
        </div>

        <div className="overflow-x-auto pb-4 pt-6 -mt-6">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="w-1/3 p-4 bg-white sticky left-0 z-20 shadow-[1px_0_0_0_#f1f5f9]"></th>
                <th className="p-4 font-bold text-slate-900 text-center text-xl">
                  Free
                </th>
                <th className="p-4 font-bold text-slate-900 text-center text-xl relative">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-white text-base font-bold uppercase tracking-wider py-1 px-3 rounded-md whitespace-nowrap shadow-sm">
                    Most popular
                  </span>
                  Basic
                </th>
                <th className="p-4 font-bold text-slate-900 text-center text-xl">
                  Professional
                </th>
                <th className="p-4 font-bold text-slate-900 text-center text-xl">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {compareTableFeatures.map((section, idx) => (
                <React.Fragment key={idx}>
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 px-6 font-bold text-slate-900 bg-slate-50 border-y border-slate-200 mt-4 rounded-t-xl text-lg"
                    >
                      {section.category}
                    </td>
                  </tr>
                  {section.items.map((item, itemIdx) => (
                    <tr
                      key={itemIdx}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-5 text-base font-medium text-slate-700 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#f1f5f9]">
                        {item.name}
                      </td>
                      {[
                        item.free,
                        item.basic,
                        item.professional,
                        item.enterprise,
                      ].map((val, i) => (
                        <td key={i} className="p-5 text-center">
                          {typeof val === "boolean" ? (
                            val ? (
                              <div className="mx-auto flex justify-center">
                                <Check
                                  className="h-6 w-6 text-primary"
                                  strokeWidth={3}
                                />
                              </div>
                            ) : (
                              <div className="mx-auto flex justify-center">
                                <Minus
                                  className="h-6 w-6 text-slate-300"
                                  strokeWidth={3}
                                />
                              </div>
                            )
                          ) : (
                            <span className="text-base font-semibold text-slate-600">
                              {val}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
};

export default CompareTable;
