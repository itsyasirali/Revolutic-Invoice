import React from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/layout/container";
import { ShieldCheck, Lock, Globe } from "lucide-react";

const FOOTER_NAV = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Solutions", href: "/#solutions" },
    { label: "Pricing & Plans", href: "/pricing" },
    { label: " Templates", href: "/templates" },
    { label: "Book a Demo", href: "/demo" },
  ],
  solutions: [
    { label: "Freelancers & Consultants", href: "/#solutions" },
    { label: "Small & Mid Businesses", href: "/#solutions" },
    { label: "Digital Agencies", href: "/#solutions" },
    { label: "Enterprises", href: "/pricing" },
    { label: "International Invoicing", href: "/#features" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Customer Stories", href: "/#testimonials" },
    { label: "Contact & Support", href: "/demo" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
};

const LandingFooter = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-20 pb-12 border-t border-slate-900">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center p-1.5 shadow-sm">
                <Image
                  src="/assets/SmartyIcon.png"
                  alt="Revolutic "
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center tracking-tight text-xl font-extrabold text-white">
                <span>Revolutic</span>
                <span className="text-primary ml-1"></span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Modern invoicing, smart customer billing, instant payments, and
              custom PDF template management built to scale your business.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <Lock className="w-4 h-4 text-primary" />
                <span>256-Bit SSL Encryption</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Product
            </h4>
            <ul className="space-y-3">
              {FOOTER_NAV.product.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Solutions
            </h4>
            <ul className="space-y-3">
              {FOOTER_NAV.solutions.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {FOOTER_NAV.company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Revolutic . All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Global Cloud Infrastructure
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default LandingFooter;
