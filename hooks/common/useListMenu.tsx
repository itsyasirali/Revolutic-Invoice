"use client";

import React, { useMemo, useState } from "react";
import ListMenu from "@/components/ui/ListMenu";
import { downloadCsv } from "@/lib/csv";
import type { ImportKind } from "@/lib/import/types";

export interface SortField<T> {
  label: string;
  value: string;
  get: (row: T) => string | number | null | undefined;
}

export interface ExportColumn<T> {
  header: string;
  get: (row: T) => unknown;
}

interface Options<T> {
  rows: T[];
  sortFields: SortField<T>[];
  exportColumns: ExportColumn<T>[];
  /** Base name of the exported file, e.g. "customers". */
  filename: string;
  importKind?: ImportKind;
  importLabel?: string;
  onRefresh: () => unknown;
}

const compare = (a: string | number | null | undefined, b: string | number | null | undefined) => {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1; // empty values last
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
};

/**
 * Shared "..." menu behaviour for list screens: sorted rows (client side, since
 * most fields are encrypted in the database), CSV export of what is shown, and
 * a list refresh. Returns the rows to display and the menu element to render.
 */
export const useListMenu = <T,>({
  rows,
  sortFields,
  exportColumns,
  filename,
  importKind,
  importLabel,
  onRefresh,
}: Options<T>) => {
  const [sort, setSort] = useState<{ value: string; dir: "asc" | "desc" } | null>(null);

  const sorted = useMemo(() => {
    const field = sort && sortFields.find((f) => f.value === sort.value);
    if (!sort || !field) return rows;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((x, y) => {
      const ax = field.get(x);
      const ay = field.get(y);
      const emptyX = ax === null || ax === undefined || ax === "";
      const emptyY = ay === null || ay === undefined || ay === "";
      if (emptyX || emptyY) return compare(ax, ay); // empties stay last in both directions
      return compare(ax, ay) * factor;
    });
  }, [rows, sort, sortFields]);

  const exportCsv = () => {
    const header = exportColumns.map((c) => c.header);
    const body = sorted.map((r) => exportColumns.map((c) => c.get(r) ?? ""));
    downloadCsv(`${filename}-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...body]);
  };

  const menu = (
    <ListMenu
      sort={{
        options: sortFields.map(({ label, value }) => ({ label, value })),
        active: sort,
        // same field again flips the direction
        onChange: (value) =>
          setSort((s) => (s && s.value === value ? { value, dir: s.dir === "asc" ? "desc" : "asc" } : { value, dir: "asc" })),
      }}
      importKind={importKind}
      importLabel={importLabel}
      onExport={exportCsv}
      onRefresh={onRefresh}
    />
  );

  return { rows: sorted, menu };
};

export default useListMenu;
