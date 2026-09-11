"use client";

import React, { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { TemplateFormProvider } from "@/context/TemplateFormContext";
import { ToastContainer } from "@/components/ui";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

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
