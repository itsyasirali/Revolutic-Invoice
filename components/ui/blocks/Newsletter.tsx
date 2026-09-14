"use client";

import React, { useState } from "react";
import Container from "@/components/layout/container";
import Button from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

const Newsletter = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="py-16">
      <Container>
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl border border-slate-800 p-8 sm:p-12 md:p-16 text-white">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Stay ahead in business & finance
            </h2>
            <p className="text-slate-300 font-medium text-base">
              Get the latest invoicing tips, cash-flow guides, and product updates delivered to your inbox once a month.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 pt-4 text-emerald-400 font-semibold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>Thank you for subscribing to Revolutic Invoice updates!</span>
              </div>
            ) : (
              <form
                className="flex flex-col sm:flex-row gap-3 pt-4"
                onSubmit={handleSubmit}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  className="flex-1 px-4 py-3.5 rounded-xl text-white bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm placeholder:text-slate-400"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="rounded-xl px-8 font-semibold shadow-md shadow-primary/25 shrink-0"
                >
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Newsletter;
