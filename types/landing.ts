import type { ReactNode } from "react";
import type { User } from "@/context/AuthContext";

export interface MarketingLayoutProps {
  children: ReactNode;
}

export interface ClientBrand {
  name: string;
  tagline?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface UseBillingViewReturn {
  isAnnual: boolean;
  selectMonthly: () => void;
  selectAnnual: () => void;
}

export interface UseLandingNavbarReturn {
  user: User | null;
  navLinks: NavLink[];
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}
