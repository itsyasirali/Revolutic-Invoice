"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { NavLink, UseLandingNavbarReturn } from "@/types/landing";

const NAV_LINKS: NavLink[] = [
  { label: "Industries", href: "/industries" },
  { label: "Customers", href: "/customers-stories" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Customer Portal", href: "/portal/login" },
];

const useLandingNavbar = (): UseLandingNavbarReturn => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return {
    user,
    navLinks: NAV_LINKS,
    mobileMenuOpen,
    toggleMobileMenu: () => setMobileMenuOpen((prev) => !prev),
    closeMobileMenu: () => setMobileMenuOpen(false),
  };
};

export default useLandingNavbar;
