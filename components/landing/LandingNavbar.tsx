"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Menu, X, ArrowRight } from "lucide-react";
import useLandingNavbar from "@/hooks/landing/useLandingNavbar";

const LandingNavbar = () => {
  const { user, navLinks, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useLandingNavbar();
  // "/dashboard" is resolved by the middleware from the session cookie: straight to the
  // org dashboard when signed in, to /login when not (no waiting for a profile fetch).
  const signInHref = "/dashboard";
  const startHref = user ? "/dashboard" : "/register";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/70 transition-all">
      <div className="mx-auto max-w-[90%] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <Image
                src="/assets/InvoiceSmartyIcon.png"
                alt="InvoiceSmarty"
                width={36}
                height={36}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <div className="flex items-center tracking-tight text-xl font-extrabold text-slate-900">
              <span>Invoice</span>
              <span className="text-primary">Smarty</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-4">
                            <Button
                  variant="outline"
                  size="md"
                  className="rounded-full text-slate-700! font-semibold bg-transparent! hover:bg-transparent! hover:text-slate-700! border-slate-300! hover:border-slate-300! active:border-black! focus:border-black! focus-visible:border-black! active:bg-transparent! focus:bg-transparent! focus:ring-0! focus:ring-offset-0! active:scale-100! shadow-none!"
                  asChild
                >
                  <Link href={signInHref} prefetch={false}>Sign In</Link>
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="rounded-full shadow-md shadow-primary/20 font-semibold"
                  asChild
                >
                  <Link href={startHref} className="flex items-center gap-2">
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white px-6 py-6 space-y-4 shadow-xl animate-slide-up">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="text-base font-semibold text-slate-700 hover:text-primary py-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                            <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="rounded-xl text-slate-700! font-semibold bg-transparent! hover:bg-transparent! hover:text-slate-700! border-slate-300! hover:border-slate-300! active:border-black! focus:border-black! focus-visible:border-black! active:bg-transparent! focus:bg-transparent! focus:ring-0! focus:ring-offset-0! active:scale-100! shadow-none!"
                  asChild
                >
                  <Link
                    href={signInHref}
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="rounded-xl shadow-md font-semibold"
                  asChild
                >
                  <Link
                    href={startHref}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
