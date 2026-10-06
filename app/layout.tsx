import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import MainLayout from "@/layout/Main";
import { getServerSessionUser } from "@/lib/session";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_DESCRIPTION =
  "InvoiceSmarty is invoicing software for growing businesses: create invoices and quotes, record payments, track time and expenses, manage projects, and give customers a self-service portal.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://invoicesmarty.com"),
  title: {
    default: "InvoiceSmarty - Invoicing, Payments & Time Tracking",
    template: "%s | InvoiceSmarty",
  },
  description: SITE_DESCRIPTION,
  applicationName: "InvoiceSmarty",
  keywords: [
    "invoicing software",
    "online invoices",
    "quotes",
    "payments",
    "time tracking",
    "expense tracking",
    "customer portal",
    "billing",
  ],
  openGraph: {
    type: "website",
    siteName: "InvoiceSmarty",
    title: "InvoiceSmarty - Invoicing, Payments & Time Tracking",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "InvoiceSmarty - Invoicing, Payments & Time Tracking",
    description: SITE_DESCRIPTION,
  },
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  // fast: no database round-trip before the page can start rendering
  const sessionUser = await getServerSessionUser({ fast: true });
  const initialUser = sessionUser
    ? {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        companyName: sessionUser.companyName,
        firstName: sessionUser.firstName,
        lastName: sessionUser.lastName,
        organizationId: sessionUser.organizationId ?? null,
      }
    : null;

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthWrapper initialUser={initialUser}>
          <MainLayout>{children}</MainLayout>
        </AuthWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
