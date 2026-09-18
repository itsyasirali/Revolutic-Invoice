import { NextRequest, NextResponse } from "next/server";

// Legacy flat route names that moved under app/[orgSlug]/. Redirects bookmarks/deep-links
// (e.g. the public LandingNavbar's "/dashboard" link) to the active org's URL.
const LEGACY_APP_ROUTES = [
  "dashboard",
  "customers",
  "invoices",
  "items",
  "payments",
  "templates",
  "expenses",
  "time-tracking",
  "reports",
  "quotes",
  "sales-receipts",
  "profile",
];

export function middleware(req: NextRequest) {
  const firstSegment = req.nextUrl.pathname.split("/")[1];
  if (!LEGACY_APP_ROUTES.includes(firstSegment)) {
    return NextResponse.next();
  }

  const slug = req.cookies.get("active_org_slug")?.value;
  const url = req.nextUrl.clone();
  url.pathname = slug ? `/${slug}${req.nextUrl.pathname}` : "/login";
  return NextResponse.redirect(url);
}

// matcher must be statically analyzable, so it's spelled out literally rather than derived
// from LEGACY_APP_ROUTES above (keep the two lists in sync if routes are added/removed).
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/customers",
    "/customers/:path*",
    "/invoices",
    "/invoices/:path*",
    "/items",
    "/items/:path*",
    "/payments",
    "/payments/:path*",
    "/templates",
    "/templates/:path*",
    "/expenses",
    "/expenses/:path*",
    "/time-tracking",
    "/time-tracking/:path*",
    "/reports",
    "/reports/:path*",
    "/quotes",
    "/quotes/:path*",
    "/sales-receipts",
    "/sales-receipts/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
