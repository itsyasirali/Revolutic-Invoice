import React from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/layout/container";
import industries from "@/data/industries/industries";

type FooterLink = { label: string; href: string };

const HELP_LINKS: FooterLink[] = [
  { label: "Customers", href: "/customers-stories" },
  { label: "Resources", href: "/resources" },
  { label: "About Us", href: "/about" },
  { label: "Customer Portal", href: "/portal/login" },
];

const BEST_SUITED_FOR: FooterLink[] = [
  ...industries.slice(0, 6).map((i) => ({ label: i.title, href: `/industries/${i.slug}` })),
  { label: "All Industries", href: "/industries" },
];

const LEGAL: FooterLink[] = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

/** Small uppercase column heading. */
const Heading = ({ children }: { children: React.ReactNode }) => (
  <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-200">{children}</h4>
);

const LinkList = ({ title, links }: { title?: string; links: FooterLink[] }) => (
  <div>
    {title && <p className="mb-4 text-sm font-semibold text-white">{title}</p>}
    <ul className="space-y-3">
      {links.map((item) => (
        <li key={item.label}>
          <Link href={item.href} className="text-sm text-slate-400 transition-colors hover:text-white">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const LandingFooter = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 pb-10 pt-16 text-slate-300">
      <Container>
        <div className="grid grid-cols-1 gap-12 pb-12 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-6 lg:justify-self-start">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center">
                <Image
                  src="/assets/InvoiceSmartyIcon.png"
                  alt="InvoiceSmarty"
                  width={36}
                  height={36}
                  className="h-full w-full rounded-md object-contain"
                />
              </div>
              <div className="flex items-center text-xl font-extrabold tracking-tight text-white">
                <span>Invoice</span>
                <span className="text-primary">Smarty</span>
              </div>
            </Link>
            <p className="max-w-md text-base leading-relaxed text-slate-400">
              Modern invoicing, smart customer billing, instant payments, and custom PDF template management built to
              scale your business. Create quotes and invoices, record payments, track projects, expenses and time, and
              give your customers a portal to view, approve and pay, all from one place, so you can spend less time on
              billing and get paid faster.
            </p>
          </div>

          {/* Help & Resources */}
          <div className="lg:justify-self-center">
            <Heading>Help &amp; Resources</Heading>
            <LinkList links={HELP_LINKS} />
          </div>

          {/* Best suited for */}
          <div className="lg:justify-self-end">
            <Heading>Best suited for</Heading>
            <ul className="space-y-3">
              {BEST_SUITED_FOR.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} InvoiceSmarty. All rights reserved.</p>
          <ul className="flex items-center gap-6">
            {LEGAL.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
};

export default LandingFooter;
