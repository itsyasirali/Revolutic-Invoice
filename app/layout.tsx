import type { Metadata } from "next";
import "./globals.css";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import MainLayout from "@/layout/Main";

export const metadata: Metadata = {
  title: "Revolutic Invoice",
  description:
    "Revolutic Invoice - Modern invoicing, payments, customer billing, and PDF template management application.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthWrapper>
          <MainLayout>{children}</MainLayout>
        </AuthWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
