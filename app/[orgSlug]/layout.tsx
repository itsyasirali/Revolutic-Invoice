"use client";

import React, { useState } from "react";
import Sidebar from "@/layout/Sidebar";
import Header from "@/layout/Header";
import { ConfirmDialog } from "@/components/ui";
import useOrgSlugGuard from "@/hooks/organization/useOrgSlugGuard";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
  const { matchedOrg, handleCancelSwitch, handleConfirmSwitch } = useOrgSlugGuard();
  // UI-only state: sidebar collapse and highlighted menu item.
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
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

      {matchedOrg && (
        <ConfirmDialog
          isOpen
          type="info"
          title="Switch Organization"
          message={`This link is for "${matchedOrg.name}". Switch your active organization to view it?`}
          confirmText="Switch Organization"
          cancelText="Stay on Current"
          onConfirm={handleConfirmSwitch}
          onCancel={handleCancelSwitch}
        />
      )}
    </div>
  );
};

export default OrgLayout;
