"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";
import { useParams } from "next/navigation";
import { useOrganization } from "@/context/OrganizationContext";
import { buildOrgPath } from "@/lib/orgPath";

type OrgLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  Omit<LinkProps, "href"> & {
    href: string;
  };

/**
 * Drop-in replacement for next/link's Link that prefixes a string href
 * with the current organization slug (see hooks/organization/useOrgRouter.ts
 * for the matching router wrapper).
 */
export const OrgLink = React.forwardRef<HTMLAnchorElement, OrgLinkProps>(
  ({ href, ...props }, ref) => {
    const params = useParams<{ orgSlug?: string }>();
    const { organization } = useOrganization();
    const slug = params?.orgSlug || organization?.slug || null;

    return <Link ref={ref} href={buildOrgPath(slug, href)} {...props} />;
  },
);

OrgLink.displayName = "OrgLink";

export default OrgLink;
