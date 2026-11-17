"use client";

import { useRef, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "@/components/ui";
import {
  KIND_ENTITY,
  type ImportDrafts,
  type ImportIssue,
  type ImportKind,
  type RowStatus,
} from "@/lib/import/types";
import type { ImportRow as Row, ImportSchema as Schema } from "@/components/import/ImportButton";

const errorData = (err: unknown) =>
  (err as { response?: { data?: { message?: string; errors?: ImportIssue[] } } }).response?.data;

/**
 * Review-then-save CSV import: reads the file (dry run), holds the editable
 * records and statuses, and saves only when confirmed.
 */
export const useImport = (kind: ImportKind, schema: Schema) => {
  const entity = KIND_ENTITY[kind];
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [statuses, setStatuses] = useState<RowStatus[]>([]);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const close = () => {
    setOpen(false);
    setRows([]);
    setStatuses([]);
    setIssues([]);
    setWarnings([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append(kind, file);
      form.append("dryRun", "true");
      const { data } = await axios.post("/import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRows((data.drafts as ImportDrafts)[entity] ?? []);
      setStatuses(data.statuses?.[entity] ?? []);
      setIssues(data.errors ?? []);
      setWarnings(data.warnings ?? []);
      setFileName(file.name);
      setOpen(true);
    } catch (err) {
      toast.error(errorData(err)?.message || "Could not read the file", "Error");
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/import",
        { drafts: { [entity]: rows }, dryRun: false },
        { headers: { "Content-Type": "application/json" } },
      );
      const list: RowStatus[] = data.statuses?.[entity] ?? [];
      const created = list.filter((s) => s === "new").length;
      const existed = list.filter((s) => s === "exists").length;
      await schema.refresh();
      toast.success(
        `${created} ${schema.label} imported${existed ? `, ${existed} already existed` : ""}`,
        "Import complete",
      );
      close();
    } catch (err) {
      const data = errorData(err);
      if (data?.errors?.length) {
        setIssues(data.errors);
        setStatuses((prev) => {
          const next = prev.map((s): RowStatus => (s === "error" ? "new" : s));
          data.errors!.forEach((e) => (next[e.index] = "error"));
          return next;
        });
        toast.error("Fix the highlighted problems, then confirm again", "Nothing was saved");
      } else {
        toast.error(data?.message || "Import failed", "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Editing a record clears its own previous problem; the server re-validates on confirm.
  const touch = (i: number) => {
    setIssues((prev) => prev.filter((e) => e.index !== i));
    setStatuses((prev) => prev.map((s, idx) => (idx === i && s === "error" ? "new" : s)));
  };

  const setCell = (i: number, key: string, value: string) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
    touch(i);
  };

  const mapNested = (i: number, fn: (list: Row[]) => Row[]) => {
    const n = schema.nested!.key;
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [n]: fn(r[n] ?? []) } : r)));
    touch(i);
  };

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    setStatuses((prev) => prev.filter((_, idx) => idx !== i));
    setIssues((prev) =>
      prev.filter((e) => e.index !== i).map((e) => (e.index > i ? { ...e, index: e.index - 1 } : e)),
    );
  };

  const toSave = rows.filter((_, i) => statuses[i] !== "exists").length;
  const existing = rows.length - toSave;

  return {
    inputRef, loading, open, fileName, rows, statuses, issues, warnings,
    close, onFile, confirm, setCell, mapNested, removeRow, toSave, existing,
  };
};

export default useImport;
