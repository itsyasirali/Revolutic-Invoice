import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, Users, CreditCard, TrendingUp, Clock, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: FileText, title: "Instant Invoicing", text: "Branded PDFs, sent in seconds." },
  { icon: Users, title: "Customer Directory", text: "Full client history, one place." },
  { icon: CreditCard, title: "Payment Tracking", text: "Know who has paid and who hasn't." },
  { icon: TrendingUp, title: "Live Reports", text: "Revenue, expenses and time at a glance." },
  { icon: Clock, title: "Time & Expenses", text: "Bill tracked hours and expenses to clients." },
  { icon: ShieldCheck, title: "Secure by Default", text: "Encrypted data and email-code sign-in." },
];

const STATS = [
  { value: "PDF", label: "Invoices & email" },
  { value: "Multi", label: "Currency support" },
  { value: "Portal", label: "For your customers" },
];

const Logo = ({ onDark = false }: { onDark?: boolean }) => (
  <Link href="/" className="inline-flex items-center gap-2.5">
    <Image
      src="/assets/InvoiceSmartyIcon.png"
      alt="InvoiceSmarty"
      width={40}
      height={40}
      className="w-10 h-10 xl:w-12 xl:h-12 object-contain rounded-md"
    />
    <span className="flex flex-col">
      <span
        className={`font-extrabold text-xl xl:text-2xl tracking-tight leading-none ${onDark ? "text-white" : "text-slate-900"}`}
      >
        Invoice<span className={onDark ? "text-white" : "text-primary"}>Smarty</span>
      </span>
      <span
        className={`text-[9px] uppercase tracking-widest font-semibold mt-1 ${onDark ? "text-white/80" : "text-slate-400"}`}
      >
        Invoice
      </span>
    </span>
  </Link>
);

/** Soft contour lines along the bottom of the brand panel. Purely decorative. */
const Waves = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 600 220"
    preserveAspectRatio="xMidYMax slice"
    className="pointer-events-none absolute inset-x-0 bottom-0 h-56 w-full opacity-60"
  >
    {Array.from({ length: 9 }, (_, i) => (
      <path
        key={i}
        d={`M0 ${190 - i * 9} C 120 ${120 - i * 7}, 240 ${230 - i * 11}, 360 ${150 - i * 8} S 540 ${90 + i * 6}, 600 ${60 + i * 8}`}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.12 + i * 0.015}
        strokeWidth="1"
      />
    ))}
  </svg>
);

/** Two-column sign-in layout: a dark brand panel (large screens) and the form. */
export const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen w-full grid lg:grid-cols-[5fr_6fr] 2xl:grid-cols-[1fr_1fr] bg-slate-50 font-sans">
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#0c86d9] via-[#0a69b0] to-[#064270] p-10 xl:p-14 2xl:p-20 text-white lg:flex lg:flex-col lg:justify-between lg:gap-6">
      <Logo onDark />
      <div className="mt-2 2xl:mt-10">
        <p className="mb-4 xl:mb-5 text-xs xl:text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
          Invoicing &amp; business management
        </p>
        <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-[1.1] tracking-tight">
          Get paid faster.
          <br />
          Run with clarity.
        </h2>
        <p className="mt-4 xl:mt-6 max-w-sm xl:max-w-md 2xl:max-w-lg text-base xl:text-lg leading-relaxed text-white/90">
          One refined workspace to invoice clients, collect payments and understand your numbers,
          built for growing businesses.
        </p>
      </div>
      <div className="relative z-10 space-y-6 xl:space-y-8">
        <dl className="grid grid-cols-3 gap-4 max-w-md xl:max-w-lg">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <dd className="text-2xl xl:text-3xl font-bold tracking-tight">{value}</dd>
              <dt className="text-xs xl:text-sm text-white/85">{label}</dt>
            </div>
          ))}
        </dl>
        <ul className="grid gap-3.5 xl:gap-5 2xl:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-4">
              <span className="flex h-10 w-10 xl:h-12 xl:w-12 shrink-0 items-center justify-center rounded-md bg-white/15 ring-1 ring-white/20">
                <Icon className="h-5 w-5 xl:h-6 xl:w-6 text-white" />
              </span>
              <span>
                <span className="block text-sm xl:text-base font-semibold">{title}</span>
                <span className="block text-sm xl:text-[15px] text-white/85">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Waves />
    </aside>

    <main className="flex min-h-screen flex-col px-6 py-5 sm:px-12 lg:px-14 xl:px-20">
      <div className="lg:hidden">
        <Logo />
      </div>
      <div className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-[440px] xl:max-w-[500px] 2xl:max-w-[560px] py-4 xl:text-[17px] 2xl:text-lg">
          <div className="mb-6 hidden lg:block">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </main>
  </div>
);

export default AuthLayout;
