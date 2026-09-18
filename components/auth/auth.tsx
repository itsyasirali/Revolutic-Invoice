"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuthForm } from "@/hooks/auth/useAuthForm";
import { Eye, EyeOff } from "lucide-react";
import AuthSlideIllustration from "@/components/auth/AuthSlideIllustration";
import type { LoginSignupFormProps } from "@/types/auth";

const LoginSignupForm: React.FC<LoginSignupFormProps> = ({
  onLoginSuccess,
  initialMode = "login",
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const {
    isSignup,
    name,
    email,
    password,
    confirmPassword,
    error,
    loading,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSubmit,
    toggleMode,
    handleKeyPress,
  } = useAuthForm({ onLoginSuccess, initialMode });

  const handleToggle = () => {
    toggleMode();
    if (pathname === "/login") {
      router.push("/register");
    } else if (pathname === "/register" || pathname === "/signup") {
      router.push("/login");
    }
  };

  const slides = [
    {
      id: "automation",
      title: "Automated Invoicing",
      description:
        "Create recurring schedules, generate customized PDF invoices, and automatically send reminders to clients.",
      buttonText: "Explore features",
      link: "/#features",
    },
    {
      id: "payments",
      title: "Instant Global Payments",
      description:
        "Accept payments seamlessly worldwide with automated reconciliation, card processing, and zero payment delays.",
      buttonText: "Payment methods",
      link: "/#features",
    },
    {
      id: "clients",
      title: "Client & Vendor Management",
      description:
        "Centralize customer records, manage billing profiles, and track outstanding balances in one organized dashboard.",
      buttonText: "Client tools",
      link: "/#how-it-works",
    },
    {
      id: "analytics",
      title: "Real-time Tracking & Analytics",
      description:
        "Monitor paid vs pending invoices, analyze monthly cash flow, and export clean financial reports anytime.",
      buttonText: "View analytics",
      link: "/#how-it-works",
    },
  ];

  // Automatic slide rotation every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);



  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Subtle geometric polygonal background accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-slate-200/40 via-sky-100/20 to-transparent rotate-45" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-slate-200/30 via-blue-100/20 to-transparent rotate-12" />
      </div>

      {/* Main Auth Container Card */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-md shadow-2xl shadow-slate-300/40 border border-slate-100 flex flex-col md:flex-row overflow-hidden min-h-[34rem]">
        {/* ================= LEFT COLUMN: FORM ================= */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-6 group"
            >
              <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
                <Image
                  src="/assets/InvoiceSmartyIcon.png"
                  alt="InvoiceSmarty"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
                  Invoice<span className="text-primary">Smarty</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
                  INVOICE
                </span>
              </div>
            </Link>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isSignup ? "Sign up" : "Sign in"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {isSignup ? "to get started with Invoice" : "to access Invoice"}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              {/* Full Name (Sign Up only) */}
              {isSignup && (
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    required
                    className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              )}

              {/* Email Input */}
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  required
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              {/* Password Input */}
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignup && (
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              {/* Sub-links row */}
              {!isSignup && (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="text-primary font-medium hover:underline cursor-pointer"
                  >
                    Sign in using email OTP
                  </button>
                  <button
                    type="button"
                    className="text-primary font-medium hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold rounded-md transition-colors cursor-pointer mt-3 shadow-xs"
              >
                {loading ? "Processing..." : isSignup ? "Sign up" : "Sign in"}
              </button>
            </form>
          </div>

          {/* Bottom actions */}
          <div className="mt-8 pt-4 space-y-3">
            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                Or continue with
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-md transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2.5"
              title="Continue with Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Toggle Sign In / Sign Up */}
            <p className="text-center text-xs text-slate-500">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={handleToggle}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DYNAMIC GRAPHIC & CAROUSEL ================= */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col items-center justify-between text-center bg-white">
          {/* Dynamic Illustration based on active slide */}
          <div className="my-2 transition-all duration-300">
            <AuthSlideIllustration slideId={slides[activeSlide].id} />
          </div>

          {/* Text Info */}
          <div className="space-y-2 mt-4 max-w-70">
            <h3 className="font-bold text-slate-900 text-base">
              {slides[activeSlide].title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed min-h-9">
              {slides[activeSlide].description}
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <Link
              href={slides[activeSlide].link}
              className="inline-block text-xs font-semibold text-primary bg-sky-50 hover:bg-sky-100 px-5 py-2 rounded-full transition-colors"
            >
              {slides[activeSlide].buttonText}
            </Link>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 cursor-pointer ${
                  activeSlide === index
                    ? "w-5 h-1.5 bg-primary rounded-full"
                    : "w-1.5 h-1.5 bg-slate-200 rounded-full hover:bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupForm;
