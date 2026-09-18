import type { ReactNode } from "react";

export interface MarketingLayoutProps {
  children: ReactNode;
}

export interface ClientBrand {
  name: string;
  tagline?: string;
}
