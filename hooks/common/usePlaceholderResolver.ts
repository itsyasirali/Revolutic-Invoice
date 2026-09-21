"use client";

import { useCallback, useMemo } from "react";
import useCustomPlaceholders from "@/hooks/common/useCustomPlaceholders";
import { useProfile } from "@/hooks/auth/useProfile";
import { buildPlaceholderValues } from "@/lib/placeholders/context";
import { replacePlaceholders } from "@/lib/placeholders/replace";
import type { PlaceholderScope } from "@/lib/placeholders/registry";

/** Resolves %Placeholders% in text for an invoice or payment record on the client. */
export const usePlaceholderResolver = (scope: PlaceholderScope, record: any) => {
  const { custom } = useCustomPlaceholders();
  const { user } = useProfile();

  const values = useMemo(
    () =>
      buildPlaceholderValues({
        scope,
        invoice: scope === "invoice" ? record : undefined,
        payment: scope === "payment" ? record : undefined,
        organizationName: user?.companyName,
        senderName: user?.name,
        custom,
      }),
    [scope, record, user, custom],
  );

  const resolve = useCallback(
    (text: string | null | undefined, html = false) =>
      replacePlaceholders(text, values, { html }),
    [values],
  );

  return { resolve, values };
};

export default usePlaceholderResolver;
