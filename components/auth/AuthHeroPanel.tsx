"use client";

import React from "react";
import {
  ShieldCheck,
  Send,
  FileText,
  Users,
  CreditCard,
  ChevronRight,
  Zap,
  Headphones,
  LayoutGrid,
  Settings,
  TrendingUp,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, active: true },
  { label: "Invoices", icon: FileText, active: false },
  { label: "Customers", icon: Users, active: false },
  { label: "Payments", icon: CreditCard, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const STATS = [
  { label: "Total Revenue", value: "$12,450", change: "+16%" },
  { label: "Collected", value: "$9,820", change: "+24%" },
  { label: "Pending", value: "$2,630", change: "+4%" },
];

const FLOATING_CARDS = [
  {
    title: "Instant Invoicing",
    subtitle: "Branded PDFs, sent in seconds",
    icon: FileText,
  },
  {
    title: "Customer Directory",
    subtitle: "Full client history, one place",
    icon: Users,
  },
  {
    title: "Live Cash Flow",
    subtitle: "Payments tracked in real time",
    icon: CreditCard,
  },
];

const TRUST_ITEMS = [
  { label: "Bank-Grade Encryption", icon: ShieldCheck },
  { label: "Sub-Second Sync", icon: Zap },
  { label: "24/7 Dedicated Help", icon: Headphones },
];

export const AuthHeroPanel: React.FC = () => {
  return (
    <div className="relative w-full text-left z-10 select-none">
      {/* Ambient glass light refraction flares */}
      <div className="absolute -top-16 -right-12 w-56 h-56 bg-white/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-12 w-64 h-64 bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* Top Glass Badge */}
      <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/35 text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4)]">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
        <span>Next-Gen Cloud Invoicing</span>
      </div>

      {/* Floating Paper Airplane Glass Accent */}
      <Send className="w-5 h-5 text-white/90 absolute top-1 right-2 rotate-45 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] pointer-events-none" />
      <div className="absolute top-7 right-7 w-2 h-2 rounded-full border border-dashed border-white/50 pointer-events-none" />

      {/* Hero Typography */}
      <h2 className="text-2xl sm:text-[28px] font-extrabold text-white mt-4 leading-tight tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
        Manage Your Invoices
        <br />
        <span className="bg-gradient-to-r from-white via-sky-100 to-white bg-clip-text text-transparent font-black">
          Smarter, Not Harder
        </span>
      </h2>

      <p className="text-xs sm:text-sm text-white/90 mt-2.5 max-w-sm leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] font-medium">
        Create professional invoices, track payments, manage customers, and grow
        your business in a fully transparent, ultra-fast workspace.
      </p>

      {/* Main Glass Dashboard Mockup + Floating Feature Cards */}
      <div className="relative mt-7 mb-10 sm:pr-14">
        {/* Ultra-Glass Dashboard Window */}
        <div className="w-full max-w-72 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.4)] overflow-hidden flex text-left transition-all duration-300 hover:border-white/50 hover:bg-white/15">
          {/* Frosted Sidebar */}
          <div className="w-20 bg-white/5 backdrop-blur-xl border-r border-white/15 p-2 space-y-1.5 shrink-0">
            <div className="flex items-center gap-1.5 px-1 pb-1.5 border-b border-white/15">
              <div className="w-3.5 h-3.5 rounded-md bg-white/25 border border-white/40 flex items-center justify-center text-white text-[7.5px] font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                I
              </div>
              <span className="text-[8px] font-bold text-white truncate drop-shadow-xs">
                InvoiceSmarty
              </span>
            </div>

            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md text-[6.5px] font-semibold transition-all duration-200 ${
                  item.active
                    ? "bg-white/25 text-white border border-white/35 shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] font-bold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Frosted Main Dashboard Panel */}
          <div className="flex-1 p-2.5 space-y-2 min-w-0 bg-transparent">
            <div className="text-[9.5px] font-bold text-white flex items-center justify-between drop-shadow-xs">
              <span>Financial Overview</span>
              <TrendingUp className="w-3 h-3 text-sky-200" />
            </div>

            {/* Frosted Stat Tiles */}
            <div className="grid grid-cols-3 gap-1.5">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-xl rounded-lg p-1.5 border border-white/20 space-y-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                >
                  <div className="text-[6px] text-white/80 font-medium truncate">
                    {stat.label}
                  </div>
                  <div className="text-[8.5px] font-bold text-white font-mono">
                    {stat.value}
                  </div>
                  <div className="text-[6px] font-bold text-emerald-300">
                    ↑ {stat.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Glowing Chart with Gradient Fill */}
            <div className="h-8 pt-1 relative">
              <svg
                viewBox="0 0 100 32"
                className="w-full h-full drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)]"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
                  </linearGradient>
                </defs>
                <polygon
                  points="0,32 0,22 15,18 30,22 45,10 60,14 75,4 100,8 100,32"
                  fill="url(#chartGlow)"
                />
                <polyline
                  points="0,22 15,18 30,22 45,10 60,14 75,4 100,8"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.95)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Floating Ultra-Glass Feature Cards */}
        <div className="absolute inset-x-0 -bottom-8 sm:inset-x-auto sm:top-2 sm:right-0 flex flex-col gap-2.5 sm:w-44 px-2 sm:px-0 z-20">
          {FLOATING_CARDS.map((card, i) => (
            <div
              key={card.title}
              className="bg-white/15 backdrop-blur-2xl rounded-xl border border-white/35 shadow-[0_12px_32px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] px-3 py-2 flex items-center gap-2.5 transition-all duration-300 hover:bg-white/25 hover:border-white/50 hover:translate-x-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
              style={{ marginLeft: `${i * 10}px` }}
            >
              <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md border border-white/35 text-white flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                <card.icon className="w-3.5 h-3.5 text-sky-100" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9.5px] font-bold text-white truncate drop-shadow-xs">
                  {card.title}
                </div>
                <div className="text-[7.5px] text-white/85 truncate font-medium">
                  {card.subtitle}
                </div>
              </div>
              <ChevronRight className="w-3 h-3 text-white/60 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Ultra-Glass Trust Badges */}
      <div className="flex items-center justify-around pt-6 border-t border-white/15">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1.5 text-center group cursor-default"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-200 group-hover:scale-110 group-hover:bg-white/25 group-hover:border-white/50">
              <item.icon className="w-4 h-4 text-sky-100" />
            </div>
            <span className="text-[9px] font-medium text-white/95 leading-tight max-w-18 drop-shadow-xs">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthHeroPanel;
