import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import type { ResourceCardProps } from "@/types/resource";

const ResourceCard = ({ item, baseRoute }: ResourceCardProps) => {
  return (
    <Link
      href={`/${baseRoute}/${item.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Thumbnail Image */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={true}
        />
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-white/40">
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            {item.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {item.date}
              </span>
            )}
            {item.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {item.readTime}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-primary font-bold group-hover:translate-x-0.5 transition-transform">
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ResourceCard;
