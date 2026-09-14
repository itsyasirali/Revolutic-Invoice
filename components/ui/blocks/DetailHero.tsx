import React from "react";
import Image from "next/image";
import Container from "@/components/layout/container";
import { ResourceItem } from "@/types/resource";

interface DetailHeroProps {
  item: ResourceItem;
}

const DetailHero = ({ item }: DetailHeroProps) => {
  return (
    <section className="pt-24 pb-12">
      <Container>
        <div className="w-full space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="text-primary">{item.category}</span>
              {item.readTime && (
                <>
                  <span>•</span>
                  <span>{item.readTime}</span>
                </>
              )}
              {item.date && (
                <>
                  <span>•</span>
                  <span>{item.date}</span>
                </>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {item.title}
            </h1>
          </div>

          <div className="relative w-full aspect-video">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover rounded-md"
              unoptimized={true}
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default DetailHero;
