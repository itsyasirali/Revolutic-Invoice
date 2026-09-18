"use client";

import React from "react";
import type { ReactNode } from "react";
import { TemplateFormProvider } from "@/context/TemplateFormContext";
import { ToastContainer } from "@/components/ui";

interface MainLayoutProps {
  children: ReactNode;
}

// Sidebar/Header chrome lives in app/[orgSlug]/layout.tsx - only in-app routes need it.
const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <TemplateFormProvider>
      <ToastContainer />
      {children}
    </TemplateFormProvider>
  );
};

export default MainLayout;
