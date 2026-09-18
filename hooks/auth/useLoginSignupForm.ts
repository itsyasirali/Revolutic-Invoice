"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthForm from "./useAuthForm";
import type { LoginSignupFormProps } from "@/types/auth";

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

const useLoginSignupForm = ({
  onLoginSuccess,
  initialMode = "login",
}: LoginSignupFormProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const authForm = useAuthForm({ onLoginSuccess, initialMode });

  const handleToggle = () => {
    authForm.toggleMode();
    if (pathname === "/login") {
      router.push("/register");
    } else if (pathname === "/register" || pathname === "/signup") {
      router.push("/login");
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  // Automatic slide rotation every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return {
    ...authForm,
    showPassword,
    showConfirmPassword,
    activeSlide,
    setActiveSlide,
    slides,
    handleToggle,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
};

export default useLoginSignupForm;
