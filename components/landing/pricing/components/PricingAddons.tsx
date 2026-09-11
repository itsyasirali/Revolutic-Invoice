import React from "react";
import addons from "@/data/pricing/addons";
import { Users, MessageSquare, Phone, Headset } from "lucide-react";
import Container from "@/components/layout/container";

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="h-6 w-6" />,
  MessageSquare: <MessageSquare className="h-6 w-6" />,
  Phone: <Phone className="h-6 w-6" />,
  Headset: <Headset className="h-6 w-6" />,
};

const PricingAddons = () => {
  return (
    <section className="pt-24 pb-16 md:py-24">
      <Container>
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Add-ons & extras
          </h2>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed pt-2">
            Customize your plan with additional resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {addons.map((addon, idx) => (
            <div
              key={idx}
              className="group bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-between p-8 rounded-xl border border-slate-100 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex items-center justify-center shrink-0">
                  {iconMap[addon.icon]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {addon.title}
                  </h3>
                  <p className="text-base text-slate-500 font-medium mt-1">
                    {addon.description}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-extrabold text-2xl text-slate-900">
                  {addon.price}
                </div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mt-1">
                  {addon.unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default PricingAddons;
