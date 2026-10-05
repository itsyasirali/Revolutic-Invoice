"use client";

import { useEffect } from "react";

const SUFFIX = "InvoiceSmarty";

/**
 * Sets the browser tab title once a record is loaded, e.g. "Revolutic | Customer
 * Details | InvoiceSmarty". The static page title from the route's metadata shows
 * until then. Needs no request: detail pages already have the record.
 *
 * Re-checked after every render, because Next re-applies the route's own title
 * after router.refresh().
 */
export const useDocumentTitle = (title?: string | null) => {
  useEffect(() => {
    if (!title) return;
    const full = `${title} | ${SUFFIX}`;
    if (document.title !== full) document.title = full;
  });
};

export default useDocumentTitle;
