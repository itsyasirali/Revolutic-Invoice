"use client";

import { useState } from "react";
import { useOrgRouter } from "@/hooks/organization/useOrgRouter";
import { runQuoteAction } from "@/hooks/quotes/useQuote";
import { createProjectFromQuote } from "@/hooks/projects/useProject";

export type QuoteAction = "accept" | "decline" | "viewed" | "clone" | "convert";

/** Status actions and "create project" on the quote details page. */
export const useQuoteDetailActions = (refetch: () => Promise<unknown> | void) => {
  const router = useOrgRouter();
  const [acting, setActing] = useState(false);

  const act = async (quoteId: number, action: QuoteAction) => {
    setActing(true);
    const data = await runQuoteAction(quoteId, action);
    setActing(false);
    if (!data) return;
    if (action === "convert" && data.invoice) router.push(`/invoices/${data.invoice.id}`);
    else await refetch();
  };

  const makeProject = async (quoteId: number) => {
    setActing(true);
    const project = await createProjectFromQuote(quoteId);
    setActing(false);
    if (project) router.push(`/projects/${project.id}`);
  };

  return { acting, act, makeProject };
};

export default useQuoteDetailActions;
