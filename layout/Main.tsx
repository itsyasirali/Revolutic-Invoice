"use client";

import React, { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { TemplateFormProvider } from "@/context/TemplateFormContext";
import { ToastContainer } from "@/components/ui";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/demo") ||
    pathname.startsWith("/billing");

  if (isPublicRoute) {
    return (
      <TemplateFormProvider>
        <ToastContainer />
        {children}
      </TemplateFormProvider>
    );
  }

  return (
    <TemplateFormProvider>
      <ToastContainer />
      <div className="flex min-h-screen bg-white text-slate-800">
        <Sidebar
          activeItem={activeItem}
          onMenuClick={(item) => setActiveItem(item)}
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="w-full flex-1 py-2">{children}</main>
        </div>
      </div>
    </TemplateFormProvider>
  );
};

export default MainLayout;
