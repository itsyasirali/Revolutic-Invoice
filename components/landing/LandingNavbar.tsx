"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Book Demo", href: "/demo" },
];

const LandingNavbar = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/70 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <Image
                src="/assets/SmartyIcon.png"
                alt="Revolutic "
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="flex items-center tracking-tight text-xl font-extrabold text-slate-900">
              <span>Revolutic</span>
              <span className="text-primary ml-1"></span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
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
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Button
                variant="primary"
                size="md"
                className="rounded-full shadow-md shadow-primary/20 font-semibold"
                asChild
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  className="text-slate-700 font-semibold hover:text-primary"
                  asChild
                >
                  <Link href="/dashboard">Sign In</Link>
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="rounded-full shadow-md shadow-primary/20 font-semibold"
                  asChild
                >
                  <Link href="/demo" className="flex items-center gap-2">
                    <span>Start Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
        <div className="md:hidden border-t border-slate-200/80 bg-white px-6 py-6 space-y-4 shadow-xl animate-slide-up">
          <div className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-700 hover:text-primary py-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            {user ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="rounded-xl shadow-md font-semibold"
                asChild
              >
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="rounded-xl font-semibold"
                  asChild
                >
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
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
                    href="/demo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
