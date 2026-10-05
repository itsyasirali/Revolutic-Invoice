"use client";

import React from "react";
import ImportButton from "@/components/import/ImportButton";
import { MENU_ITEM_CLASS } from "@/components/ui/SplitView";
import type { ImportKind } from "@/lib/import/types";

/** "Import ..." entry for the split view's "..." menu. */
export const ImportMenuItem: React.FC<{
  kind: ImportKind;
  label: string;
  closeMenu: () => void;
}> = ({ kind, label, closeMenu }) => (
  <ImportButton
    kind={kind}
    renderTrigger={(inputId, loading) => (
      <label
        htmlFor={inputId}
        className={`${MENU_ITEM_CLASS} ${loading ? "pointer-events-none opacity-50" : ""}`}
        onClick={closeMenu}
      >
        {label}
      </label>
    )}
  />
);

export default ImportMenuItem;
