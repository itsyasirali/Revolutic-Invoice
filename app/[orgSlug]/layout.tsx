"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Sidebar from "@/layout/Sidebar";
import Header from "@/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import { ConfirmDialog, LoadingSpinner, toast } from "@/components/ui";

const swapOrgSlug = (pathname: string, slug: string) =>
  pathname.replace(/^\/[^/]+/, `/${slug}`);

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    organization,
    organizations,
    loading: orgLoading,
    switchOrganization,
  } = useOrganization();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const loading = authLoading || orgLoading;
  const isMatch = !!organization && organization.slug === orgSlug;
  const matchedOrg = useMemo(
    () =>
      isMatch ? null : organizations.find((o) => o.slug === orgSlug) || null,
    [isMatch, organizations, orgSlug],
  );

  const handleCancelSwitch = () => {
    if (organization?.slug) {
      router.replace(swapOrgSlug(pathname, organization.slug));
    }
  };

  const handleConfirmSwitch = async () => {
    if (matchedOrg) {
      await switchOrganization(matchedOrg.id);
    }
  };

  // orgSlug doesn't belong to this user at all - nothing to confirm, just bounce back
  useEffect(() => {
    if (loading || !user || isMatch || matchedOrg) return;
    if (organization?.slug) {
      toast.error("Organization not found", "Invalid Organization");
      router.replace(swapOrgSlug(pathname, organization.slug));
    } else if (!organizations.length) {
      router.replace("/organization-setup");
    }
  }, [
    loading,
    user,
    isMatch,
    matchedOrg,
    organization?.slug,
    organizations.length,
    pathname,
    router,
  ]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
