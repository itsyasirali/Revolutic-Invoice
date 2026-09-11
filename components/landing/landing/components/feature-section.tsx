import * as React from "react";
import Container from "@/components/layout/container";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import features from "@/data/landing/features";

const FeatureSection = () => {
  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2" />

      <Container>
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Everything you need to{" "}
            <span className="text-primary">scale communication</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed pt-2">
            Powerful features designed to help your team work smarter, not
            harder. Deliver exceptional customer experiences at scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border-slate-100 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                  <div className="text-primary group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-slate-600 leading-relaxed font-medium">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeatureSection;
