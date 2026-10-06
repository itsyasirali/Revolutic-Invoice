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
  <h4 className="mb-4 text-sm font-bold uppercase sm:mb-6 tracking-wider text-white">{children}</h4>
);

const LinkList = ({ title, links }: { title?: string; links: FooterLink[] }) => (
  <div>
    {title && <p className="mb-4 text-sm font-semibold text-white">{title}</p>}
    <ul className="space-y-2.5 sm:space-y-3">
      {links.map((item) => (
        <li key={item.label}>
          <Link href={item.href} className="text-sm text-slate-300 transition-colors hover:text-white sm:text-base">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const LandingFooter = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 pb-8 pt-12 text-slate-300 sm:pb-10 sm:pt-16">
      <Container>
        <div className="grid grid-cols-1 gap-10 pb-10 sm:grid-cols-2 sm:gap-12 sm:pb-12 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 sm:space-y-6 lg:col-span-1 lg:justify-self-start">
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
              <div className="flex items-center text-lg font-extrabold tracking-tight text-white sm:text-xl">
                <span>Invoice</span>
                <span className="text-primary">Smarty</span>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
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
            <ul className="space-y-2.5 sm:space-y-3">
              {BEST_SUITED_FOR.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-slate-300 transition-colors hover:text-white sm:text-base">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-700 pt-6 text-center text-sm sm:gap-4 sm:pt-8 sm:text-left text-slate-300 sm:flex-row">
          <p>© {new Date().getFullYear()} InvoiceSmarty. All rights reserved.</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
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
