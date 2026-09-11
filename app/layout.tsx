import type { Metadata } from "next";
import "./globals.css";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import MainLayout from "@/layout/Main";
import { getServerSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Revolutic ",
  description:
    "Revolutic  - Modern invoicing, payments, customer billing, and PDF template management application.",
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const sessionUser = await getServerSessionUser();
  const initialUser = sessionUser
    ? {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        companyName: sessionUser.companyName,
        firstName: sessionUser.firstName,
        lastName: sessionUser.lastName,
      }
    : null;

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthWrapper initialUser={initialUser}>
          <MainLayout>{children}</MainLayout>
        </AuthWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
