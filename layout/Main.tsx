"use client";

import React, { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TemplateFormProvider } from "@/context/TemplateFormContext";
import { ToastContainer } from "@/components/ui";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  return (
    <TemplateFormProvider>
      <ToastContainer />
      <div className="flex min-h-screen ">
        <Sidebar
          activeItem={activeItem}
          onMenuClick={(item) => setActiveItem(item)}
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="w-full mx-auto px-6 py-3">{children}</main>
        </div>
      </div>
    </TemplateFormProvider>
  );
};

export default MainLayout;
