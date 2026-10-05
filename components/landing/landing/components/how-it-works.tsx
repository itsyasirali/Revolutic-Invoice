"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BatteryFull, Check, Pencil, Printer, Share2, Wifi, X } from "lucide-react";
import Container from "@/components/layout/container";
import steps from "@/data/landing/howitwork";

const STEP_MS = 7000;

/** Fades a piece in; `delay` (seconds) puts it after the previous ones. */
const Reveal = ({ delay = 0, className = "", children }: { delay?: number; className?: string; children: ReactNode }) => (
  <div
    className={`how-anim ${className}`}
    style={{ animation: "howFadeUp 0.5s ease both", animationDelay: `${delay}s` }}
  >
    {children}
  </div>
);

/** Types `text` out letter by letter once `delay` seconds have passed. */
const Typewriter = ({ text, delay = 0, speed = 45 }: { text: string; delay?: number; speed?: number }) => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      let i = 0;
      timer = setInterval(() => {
        i += 1;
        setShown(i);
        if (i >= text.length && timer) clearInterval(timer);
      }, speed);
    }, delay * 1000);
    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [text, delay, speed]);
  return <>{text.slice(0, shown)}</>;
};

/* ------------------------------------------------------------------ phone app screens (one per step) */

const Logo = ({ delay }: { delay: number }) => (
  <div
    className="how-anim flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white"
    style={{ animation: "howPop 0.5s ease both", animationDelay: `${delay}s` }}
  >
    A
  </div>
);

/** One paper-like card on the app screen. */
const Paper = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{children}</div>
);

const PROFILE_FIELDS = [
  { label: "Organization Name", value: "Acme Studio", delay: 0.2 },
  { label: "Industry", value: "Design & Creative", delay: 1.3 },
  { label: "Organization Location", value: "United States", delay: 2.4 },
  { label: "Street Address", value: "12 Market St, Austin", delay: 3.3 },
  { label: "Currency", value: "USD - US Dollar", delay: 4.5 },
];

const SetupBody = () => (
  <Paper>
    <div className="mb-3 flex items-center gap-3">
      <Logo delay={0.1} />
      <div className="text-[11px] text-slate-500">Enter your organization details to get started.</div>
    </div>
    <div className="space-y-2.5">
      {PROFILE_FIELDS.map((f) => (
        <Reveal key={f.label} delay={f.delay}>
          <div className="text-[10px] font-medium text-slate-500">{f.label}</div>
          <div className="mt-0.5 min-h-[28px] rounded-md border border-slate-300 px-2 py-1.5 text-[12px] text-slate-800">
            <Typewriter text={f.value} delay={f.delay + 0.2} speed={35} />
          </div>
        </Reveal>
      ))}
    </div>
  </Paper>
);

const ITEMS = [
  { name: "Brand design", amount: "$450.00" },
  { name: "Website revamp", amount: "$600.00" },
  { name: "Hosting (annual)", amount: "$200.00" },
];

const INVOICE_FIELDS = [
  { label: "Customer", value: "Alice Smith", delay: 0.2 },
  { label: "Invoice Number", value: "INV-1042", delay: 1.2 },
  { label: "Payment Terms", value: "Net 15", delay: 2 },
];

const InvoiceBody = () => (
  <Paper>
    <div className="space-y-2.5">
      {INVOICE_FIELDS.map((f) => (
        <Reveal key={f.label} delay={f.delay}>
          <div className="text-[10px] font-medium text-slate-500">{f.label}</div>
          <div className="mt-0.5 min-h-[28px] rounded-md border border-slate-300 px-2 py-1.5 text-[12px] text-slate-800">
            <Typewriter text={f.value} delay={f.delay + 0.2} speed={35} />
          </div>
        </Reveal>
      ))}
    </div>
    <Reveal delay={2.8} className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      Item Details
    </Reveal>
    <div className="mt-1 overflow-hidden rounded-md border border-slate-200">
      {ITEMS.map((it, i) => (
        <Reveal key={it.name} delay={3 + i * 0.5} className="flex justify-between border-b border-slate-100 px-2 py-2 text-[11px] text-slate-700 last:border-b-0">
          <span>{it.name}</span>
          <span>{it.amount}</span>
        </Reveal>
      ))}
    </div>
    <Reveal delay={4.6} className="mt-2 flex justify-between text-[12px] font-bold text-slate-900">
      <span>Total (USD)</span>
      <span>1,250.00</span>
    </Reveal>
  </Paper>
);

const PAY_FIELDS = [
  { label: "Customer", value: "Alice Smith", delay: 0.2 },
  { label: "Amount Received", value: "USD 1,250.00", delay: 1.2 },
  { label: "Payment Mode", value: "Bank Transfer", delay: 2.3 },
  { label: "Reference No", value: "TRX-20931", delay: 3.2 },
];

const PaidBody = () => (
  <Paper>
    <div className="space-y-2.5">
      {PAY_FIELDS.map((f) => (
        <Reveal key={f.label} delay={f.delay}>
          <div className="text-[10px] font-medium text-slate-500">{f.label}</div>
          <div className="mt-0.5 min-h-[28px] rounded-md border border-slate-300 px-2 py-1.5 text-[12px] text-slate-800">
            <Typewriter text={f.value} delay={f.delay + 0.2} speed={35} />
          </div>
        </Reveal>
      ))}
    </div>
    <Reveal delay={4.2} className="mt-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Unpaid Invoices</div>
      <div className="mt-1 flex items-center justify-between rounded-md bg-emerald-50 px-2 py-2 text-[11px]">
        <span className="flex items-center gap-1.5 font-medium text-slate-800">
          <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} /> INV-1042
        </span>
        <span className="font-semibold text-emerald-700">1,250.00 applied</span>
      </div>
    </Reveal>
  </Paper>
);

const SCREENS = [
  { header: "New Organization", Body: SetupBody, total: null, secondary: "Skip", primary: "Get Started", doneDelay: 5.8, done: "Organization saved" },
  { header: "New Invoice", Body: InvoiceBody, total: "$1,250.00", secondary: "Save as Draft", primary: "Save & Send", doneDelay: 5.2, done: "Invoice Sent & Tracked" },
  { header: "Record Payment", Body: PaidBody, total: null, secondary: "Save as Draft", primary: "Save & Send", doneDelay: 5.2, done: "Payment recorded, invoice paid" },
];

const HowItWorks = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Move to the next step on its own, restarting the timer whenever a step is picked.
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % steps.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, paused]);

  const { header, Body, total, secondary, primary, doneDelay, done } = SCREENS[active];

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-black py-24 text-white">

      <Container>
        <div className="relative grid items-center gap-16 lg:grid-cols-2">
          <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">How it works</h2>
            <p className="mb-8 text-lg text-slate-300">
              Skip the spreadsheets. We&apos;ve simplified billing so you can send your first professional invoice in minutes.
            </p>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const on = index === active;
                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => setActive(index)}
                    className={`flex w-full gap-4 rounded-2xl p-4 text-left transition-colors cursor-pointer ${
                      on ? "bg-white/5" : "hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold transition-colors ${
                        on ? "bg-primary text-white" : "bg-white/10 text-primary"
                      }`}
                    >
                      {step.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`mb-1.5 text-xl font-semibold transition-colors ${on ? "text-white" : "text-slate-300"}`}>
                        {step.title}
                      </h3>
                      <p className={`transition-colors ${on ? "text-slate-300" : "text-slate-500"}`}>{step.description}</p>
                      {on && (
                        <div className="mt-3 h-0.5 overflow-hidden rounded bg-white/10">
                          <div
                            key={active}
                            className="h-full bg-primary"
                            style={{
                              animation: `stepProgress ${STEP_MS}ms linear forwards`,
                              animationPlayState: paused ? "paused" : "running",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="relative mx-auto mt-10 w-full max-w-[340px] lg:mt-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Phone showing the mobile app. Keyed so animations restart on every step. */}
            <div className="rounded-[3rem] border border-white/10 bg-neutral-900 p-3 shadow-[0_30px_80px_-20px_rgba(26,163,255,0.25)]">
              <div key={active} className="relative flex h-[620px] flex-col overflow-hidden rounded-[2.4rem] bg-white text-slate-900">
                <div className="absolute left-1/2 top-2.5 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

                {/* status bar */}
                <div className="flex items-center justify-between px-7 pb-1 pt-3 text-[11px] font-semibold">
                  <span>9:30</span>
                  <span className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3" />
                    <BatteryFull className="h-3.5 w-3.5" />
                  </span>
                </div>

                {/* app header */}
                <div className="flex items-center gap-3 px-5 py-3">
                  <X className="h-4 w-4 shrink-0 text-slate-600" />
                  <h3 className="truncate text-[15px] font-medium text-slate-800">{header}</h3>
                </div>

                <div className="flex-1 overflow-hidden bg-slate-50 px-4 py-4">
                  <Body />
                </div>

                {/* bottom bar */}
                <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3">
                  {total && (
                    <div className="mb-3 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500">Invoice Total</div>
                        <div className="text-xl font-semibold">{total}</div>
                      </div>
                      <div className="flex gap-3 text-slate-600">
                        <Pencil className="h-4 w-4" />
                        <Printer className="h-4 w-4" />
                        <Share2 className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                  <Reveal delay={doneDelay} className="grid grid-cols-[1fr_1.4fr] gap-2">
                    <div className="rounded-md border border-slate-800 px-2 py-2.5 text-center text-xs font-medium">{secondary}</div>
                    <div className="rounded-md bg-primary px-2 py-2.5 text-center text-xs font-semibold text-white">{primary}</div>
                  </Reveal>
                  <div className="mt-2 flex items-center justify-center gap-2 text-[11px] font-semibold text-primary">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <Reveal delay={doneDelay + 0.3}>{done}</Reveal>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;
