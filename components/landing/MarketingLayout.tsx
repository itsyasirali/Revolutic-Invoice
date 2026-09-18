import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";
import type { MarketingLayoutProps } from "@/types/landing";

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-primary/20 selection:text-primary">
      <LandingNavbar />
      <main className="flex-1 w-full">{children}</main>
      <LandingFooter />
    </div>
  );
};

export default MarketingLayout;
