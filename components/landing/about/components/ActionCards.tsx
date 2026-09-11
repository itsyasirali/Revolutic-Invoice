import React from "react";
import Container from "@/components/layout/container";
import actionCards from "@/data/about/actionCards";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const ActionCards = () => {
  return (
    <section className="pb-32 border-b border-slate-100">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - News */}
          <div className="group bg-white/50 cursor-pointer backdrop-blur-sm shadow-sm rounded-xl p-8 border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 col-span-1 md:col-span-2 lg:col-span-1">
            {actionCards[0].tag && (
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                {actionCards[0].tag}
              </div>
            )}
            <div className="flex-1 mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {actionCards[0].title}
              </h3>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6">
              <Image
                src={actionCards[0].image!}
                alt="News"
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>

            <Button
              variant="ghost"
              className="text-primary hover:bg-transparent w-fit pl-0 mt-auto flex items-center gap-2 group font-semibold"
              asChild
            > 
              <Link href="/auth">
                {actionCards[0].buttonText}{" "}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
            {/* Card 2 - Join team */}
            <div className="group bg-white/50 cursor-pointer backdrop-blur-sm shadow-sm rounded-xl p-8 md:p-12 border border-slate-100 flex flex-col md:flex-row gap-8 justify-between hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 flex-1">
              <div className="flex-1">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300 shadow-sm border border-slate-100">
                  <div className="h-4 w-6 bg-primary group-hover:bg-white rounded-sm transition-colors duration-300" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                  {actionCards[1].title}
                </h3>
                <p className="text-slate-600 text-base mb-8 max-w-sm font-medium leading-relaxed">
                  {actionCards[1].description}
                </p>
                <Button
                  variant="ghost"
                  className="text-primary hover:bg-transparent w-fit pl-0 flex items-center gap-2 group font-semibold"
                  asChild
                >
                  <Link href="/demo">
                    {actionCards[1].buttonText}{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Card 3 - Become partner */}
            <div className="group bg-white/50 cursor-pointer backdrop-blur-sm shadow-sm rounded-xl p-8 md:p-12 border border-slate-100 flex flex-col md:flex-row gap-8 justify-between hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 flex-1">
              <div className="flex-1">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300 shadow-sm border border-slate-100">
                  <div className="h-5 w-5 rounded-full border-[3px] border-primary group-hover:border-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                  {actionCards[2].title}
                </h3>
                <p className="text-slate-600 text-base mb-8 max-w-sm font-medium leading-relaxed">
                  {actionCards[2].description}
                </p>
                <Button
                  variant="ghost"
                  className="text-primary hover:bg-transparent w-fit pl-0 flex items-center gap-2 group font-semibold"
                  asChild
                >
                  <Link href="#">
                    {actionCards[2].buttonText}{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ActionCards;
