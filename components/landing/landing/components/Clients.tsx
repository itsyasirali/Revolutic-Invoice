import * as React from "react";
import Container from "@/components/layout/container";

interface ClientBrand {
  name: string;
  tagline?: string;
}

const clientBrands: ClientBrand[] = [
  { name: "Stripe", tagline: "Financial Infrastructure" },
  { name: "QuickBooks", tagline: "Accounting" },
  { name: "Wise", tagline: "Cross-Border Payments" },
  { name: "Revolut", tagline: "Business Banking" },
  { name: "Xero", tagline: "Cloud Accounting" },
  { name: "Shopify", tagline: "Commerce Platform" },
  { name: "Square", tagline: "Point of Sale" },
  { name: "PayPal", tagline: "Payment Gateway" },
  { name: "Salesforce", tagline: "Enterprise CRM" },
  { name: "Slack", tagline: "Team Collaboration" },
];

const Clients = () => {
  const brands = [...clientBrands, ...clientBrands];

  return (
    <section className="py-16 overflow-hidden border-y border-slate-100/80 bg-slate-50/50">
      <Container>
        <div className="w-full">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
            Trusted by 10,000+ businesses & modern finance teams worldwide
          </p>

          <div className="flex relative w-full overflow-hidden mask-fade">
            <div className="flex gap-12 min-w-max animate-marquee items-center pl-8">
              {brands.map((brand, index) => (
                <div
                  key={`${brand.name}-${index}`}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-slate-200/60 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  <span className="font-bold text-slate-700 text-sm tracking-tight">
                    {brand.name}
                  </span>
                  {brand.tagline && (
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                      • {brand.tagline}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Clients;
