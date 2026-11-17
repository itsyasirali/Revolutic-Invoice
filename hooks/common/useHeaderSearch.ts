"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Users, Package, FileText, DollarSign, Layout } from "lucide-react";
import axios from "@/lib/axios";
import { useOrgRouter } from "@/hooks/organization/useOrgRouter";
import { setNavState } from "@/lib/clientNavState";
import type { SearchResultItem } from "@/types/common";

const getSearchConfig = (routePath: string) => {
  if (
    routePath === "/" ||
    routePath.startsWith("/dashboard") ||
    routePath.startsWith("/customers")
  ) {
    return {
      type: "customers",
      placeholder: "Search customers...",
      basePath: "/customers",
    };
  }
  if (routePath.startsWith("/items")) {
    return {
      type: "items",
      placeholder: "Search items...",
      basePath: "/items",
    };
  }
  if (routePath.startsWith("/invoices")) {
    return {
      type: "invoices",
      placeholder: "Search invoices...",
      basePath: "/invoices",
    };
  }
  if (routePath.startsWith("/payments")) {
    return {
      type: "payments",
      placeholder: "Search payments...",
      basePath: "/payments",
    };
  }
  if (routePath.startsWith("/projects")) {
    return { type: "projects", placeholder: "Search projects...", basePath: "/projects" };
  }
  if (routePath.startsWith("/quotes")) {
    return { type: "quotes", placeholder: "Search quotes...", basePath: "/quotes" };
  }
  if (routePath.startsWith("/expenses")) {
    return { type: "expenses", placeholder: "Search expenses...", basePath: "/expenses" };
  }
  if (routePath.startsWith("/time-tracking")) {
    return { type: "time entries", placeholder: "Search time entries...", basePath: "/time-tracking" };
  }
  if (routePath.startsWith("/templates")) {
    return {
      type: "templates",
      placeholder: "Search templates...",
      basePath: "/templates",
    };
  }
  return {
    type: "customers",
    placeholder: "Search customers...",
    basePath: "/customers",
  };
};

/** Context-aware global search: picks the entity from the route and queries the API. */
export const useHeaderSearch = () => {
  const pathname = usePathname();
  const router = useOrgRouter();
  // Strip the leading /{orgSlug} segment before matching against the routePath prefixes above
  const routePath = pathname.replace(/^\/[^/]+/, "") || "/dashboard";
  const searchConfig = useMemo(() => getSearchConfig(routePath), [routePath]);

  const handleSearch = useCallback(
    async (searchTerm: string): Promise<SearchResultItem[]> => {
      if (!searchConfig) return [];
      const lower = searchTerm.toLowerCase();

      try {
        if (searchConfig.type === "customers") {
          const res = await axios.get("/customers");
          const customers = res.data?.customers || [];
          return customers
            .filter(
              (c: any) =>
                (c.displayName || "").toLowerCase().includes(lower) ||
                (c.companyName || "").toLowerCase().includes(lower) ||
                (c.email || "").toLowerCase().includes(lower) ||
                (c.phone || "").toLowerCase().includes(lower) ||
                (c.contacts?.[0]?.email || "").toLowerCase().includes(lower) ||
                (c.contacts?.[0]?.contact || "").toLowerCase().includes(lower),
            )
            .map((c: any) => ({
              id: c.id,
              title: c.displayName || c.companyName || "Customer",
              subtitle: [c.companyName, c.contacts?.[0]?.email || c.email]
                .filter(Boolean)
                .join(" • "),
              category: "Customer",
              badge: c.status,
              badgeVariant: c.status === "Active" ? "success" : "default",
              icon: Users,
              href: `/customers/${c.id}`,
              // The details page reads the customer from nav state, so it must
              // be stored before navigating (same as the customers list does).
              onClick: () => {
                setNavState(`customer:${c.id}`, c);
                router.push(`/customers/${c.id}`);
              },
            }));
        }

        if (searchConfig.type === "items") {
          const res = await axios.get("/items");
          const items = res.data?.items || [];
          return items
            .filter(
              (i: any) =>
                (i.name || "").toLowerCase().includes(lower) ||
                (i.description || "").toLowerCase().includes(lower) ||
                (i.unit || "").toLowerCase().includes(lower),
            )
            .map((i: any) => ({
              id: i.id,
              title: i.name || "Item",
              subtitle: `${i.currency || "$"}${i.sellingPrice ?? 0} • ${i.unit || "unit"}`,
              category: "Item",
              badge: i.status,
              badgeVariant: i.status === "Active" ? "success" : "default",
              icon: Package,
              href: `/items/${i.id}`,
              onClick: () => {
                setNavState(`item:${i.id}`, i);
                router.push(`/items/${i.id}`);
              },
            }));
        }

        if (searchConfig.type === "invoices") {
          const res = await axios.get("/invoices");
          const invoices = res.data?.invoices || [];
          return invoices
            .filter(
              (inv: any) =>
                (inv.invoiceNumber || "").toLowerCase().includes(lower) ||
                (inv.customer?.displayName || "")
                  .toLowerCase()
                  .includes(lower) ||
                (inv.customer?.companyName || "")
                  .toLowerCase()
                  .includes(lower) ||
                String(inv.total || "").includes(lower),
            )
            .map((inv: any) => ({
              id: inv.id,
              title: inv.invoiceNumber || `INV-${inv.id}`,
              subtitle: `${inv.customer?.displayName || "Customer"} • ${inv.currency || "$"}${inv.total || 0}`,
              category: "Invoice",
              badge: inv.status,
              badgeVariant:
                String(inv.status).toLowerCase() === "paid"
                  ? "success"
                  : "warning",
              icon: FileText,
              href: `/invoices/preview/${inv.id}`,
            }));
        }

        if (searchConfig.type === "payments") {
          const res = await axios.get("/payments");
          const payments = res.data?.payments || [];
          return payments
            .filter(
              (p: any) =>
                (p.customerDisplayName || "").toLowerCase().includes(lower) ||
                (p.customerEmail || "").toLowerCase().includes(lower) ||
                (p.paymentMode || "").toLowerCase().includes(lower) ||
                (p.referenceNo || "").toLowerCase().includes(lower) ||
                String(p.paymentNumber || "").includes(lower),
            )
            .map((p: any) => ({
              id: p.id,
              title: `Payment #${p.paymentNumber || p.id}`,
              subtitle: `${p.customerDisplayName} • ${p.currency || "$"}${p.amountReceived} (${p.paymentMode})`,
              category: "Payment",
              badge: p.status || "Paid",
              badgeVariant: "success",
              icon: DollarSign,
              href: `/payments/${p.id}`,
            }));
        }

        if (searchConfig.type === "templates") {
          const res = await axios.get("/templates");
          const raw =
            res.data?.templates || (Array.isArray(res.data) ? res.data : []);
          return raw
            .filter(
              (t: any) =>
                (t.templateName || t.name || "")
                  .toLowerCase()
                  .includes(lower) ||
                (t.paperSize || "").toLowerCase().includes(lower),
            )
            .map((t: any) => ({
              id: t.id,
              title: t.templateName || t.name || "Template",
              subtitle: `${t.paperSize || "A4"} • ${t.orientation || "portrait"}`,
              category: "Template",
              icon: Layout,
              href: `/templates/edit/${t.id}`,
            }));
        }

        if (searchConfig.type === "projects") {
          const res = await axios.get("/projects");
          return (res.data?.projects || [])
            .filter((p: any) =>
              [p.projectNumber, p.name, p.customer?.displayName, p.customer?.companyName].some((v) =>
                String(v || "").toLowerCase().includes(lower),
              ),
            )
            .map((p: any) => ({
              id: p.id,
              title: p.name,
              subtitle: `${p.projectNumber} \u2022 ${p.customer?.displayName || "Customer"}`,
              category: "Project",
              badge: p.status,
              badgeVariant: p.status === "Active" ? "success" : "warning",
              icon: FileText,
              href: `/projects/${p.id}`,
            }));
        }

        if (searchConfig.type === "quotes") {
          const res = await axios.get("/quotes");
          return (res.data?.quotes || [])
            .filter((q: any) =>
              [q.quoteNumber, q.referenceNumber, q.customer?.displayName, q.customer?.companyName].some((v) =>
                String(v || "").toLowerCase().includes(lower),
              ),
            )
            .map((q: any) => ({
              id: q.id,
              title: q.quoteNumber,
              subtitle: `${q.customer?.displayName || "Customer"} • ${q.currency || ""} ${q.total ?? 0}`,
              category: "Quote",
              badge: q.status,
              badgeVariant: "warning",
              icon: FileText,
              href: `/quotes/${q.id}`,
            }));
        }

        if (searchConfig.type === "expenses") {
          const res = await axios.get("/expenses");
          return (res.data?.expenses || [])
            .filter((e: any) =>
              [e.expenseNumber, e.vendor, e.description, e.category?.name, e.customer?.displayName].some((v) =>
                String(v || "").toLowerCase().includes(lower),
              ),
            )
            .map((e: any) => ({
              id: e.id,
              title: e.expenseNumber,
              subtitle: `${e.vendor || e.category?.name || "Expense"} • ${e.currency || ""} ${e.total ?? 0}`,
              category: "Expense",
              badge: e.status,
              badgeVariant: "warning",
              icon: DollarSign,
              href: `/expenses/${e.id}`,
            }));
        }

        if (searchConfig.type === "time entries") {
          const res = await axios.get("/time-tracking");
          return (res.data?.timeEntries || [])
            .filter((t: any) =>
              [t.entryNumber, t.project, t.description, t.customer?.displayName].some((v) =>
                String(v || "").toLowerCase().includes(lower),
              ),
            )
            .map((t: any) => ({
              id: t.id,
              title: t.entryNumber || `Entry ${t.id}`,
              subtitle: [t.customer?.displayName, t.project, t.description].filter(Boolean).join(" • "),
              category: "Time Entry",
              badge: t.status,
              badgeVariant: "warning",
              icon: FileText,
              href: `/time-tracking/${t.id}`,
            }));
        }

        return [];
      } catch (err) {
        console.error("[HeaderSearch] search error:", err);
        return [];
      }
    },
    [searchConfig, router],
  );

  return { searchConfig, handleSearch };
};

export default useHeaderSearch;
