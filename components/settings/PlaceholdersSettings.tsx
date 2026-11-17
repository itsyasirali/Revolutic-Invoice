"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, Copy, Check, Search, Plus, X, Braces } from "lucide-react";
import { PageHeader, Button, Input, Textarea, toast } from "@/components/ui";
import usePlaceholdersSettings from "@/hooks/common/usePlaceholdersSettings";

const inputCls =
  "w-full text-sm bg-white border border-gray-200 rounded-md px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

const PlaceholdersSettings: React.FC = () => {
  const { form, saving, query, setQuery, customShown, groups, add, remove, saveValue } =
    usePlaceholdersSettings();
  // UI-only state: modal visibility and the "copied" tick.
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const copy = async (k: string) => {
    try {
      await navigator.clipboard.writeText(`%${k}%`);
      setCopied(k);
      setTimeout(() => setCopied((c) => (c === k ? null : c)), 1500);
    } catch {
      toast.error("Could not copy", "Error");
    }
  };

  const handleAdd = async () => {
    if (await add()) setOpen(false);
  };

  return (
    <div className="pb-10">
      <PageHeader
        title="Placeholders"
        subtitle="Use %Name% in emails and invoice notes. Values are filled in when sent."
      />
      <div className="px-2 sm:px-4 md:px-6 mt-6">
        <section className="bg-white border border-gray-200 rounded-md">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-gray-500">
              Click any placeholder to copy it. Add your own for reusable text such as bank details.
            </p>
            <div className="flex items-center gap-3">
              <div className="relative sm:w-64 flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className={`${inputCls} pl-9`}
                  placeholder="Search placeholders"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 transition shrink-0"
              >
                <Plus size={16} /> Add placeholder
              </button>
            </div>
          </div>
          <div className="p-5 space-y-6">
            {customShown.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Custom</h3>
                <ul className="divide-y divide-gray-100 border border-gray-200 rounded-md overflow-hidden">
                  {customShown.map((c) => (
                    <li key={c.id} className="flex items-start gap-3 p-3 bg-white">
                      <code className="text-xs font-mono text-primary bg-primary/10 rounded-md px-2 py-1.5 shrink-0 mt-0.5">
                        %{c.key}%
                      </code>
                      <textarea
                        key={c.value}
                        className={inputCls}
                        rows={2}
                        defaultValue={c.value}
                        onBlur={(e) => saveValue(c.id, c.value, e.target.value)}
                      />
                      <button
                        onClick={() => remove(c.id, c.key)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {groups.length === 0 && customShown.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No placeholders match your search.</p>
            )}
            {groups.map(([group, defs]) => (
              <div key={group}>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{group}</h3>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {defs.map((d) => (
                    <li key={d.key}>
                      <button
                        type="button"
                        onClick={() => copy(d.key)}
                        className="group w-full text-left cursor-pointer border border-gray-200 rounded-md px-3 py-2 hover:border-primary hover:bg-primary/5 transition"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <code className="text-xs font-mono text-gray-900 truncate">%{d.key}%</code>
                          {copied === d.key ? (
                            <Check size={14} className="text-green-600 shrink-0" />
                          ) : (
                            <Copy size={14} className="text-gray-300 group-hover:text-primary shrink-0" />
                          )}
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5 truncate">{d.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="relative bg-white rounded-b-md border-x border-b border-slate-200 max-w-md w-full z-10 overflow-hidden">
              <div className="flex items-start gap-4 p-6">
                <div className="p-2.5 rounded-md bg-sky-50 shrink-0 text-sky-600">
                  <Braces className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900">Add Placeholder</h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Create reusable text you can insert as %Key% in emails and notes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-md transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 pb-2 flex flex-col gap-4">
                <Input label="Key" required placeholder="e.g. BankDetails" value={form.key} onChange={(e) => form.setKey(e.target.value)} />
                <Input label="Label" placeholder="Optional friendly name" value={form.label} onChange={(e) => form.setLabel(e.target.value)} />
                <Textarea label="Value" required rows={4} placeholder="Text that replaces the placeholder" value={form.value} onChange={(e) => form.setValue(e.target.value)} />
              </div>

              <div className="flex gap-2.5 justify-end px-6 py-4">
                <Button onClick={() => setOpen(false)} variant="outline" size="sm" disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} variant="primary" size="sm" loading={saving}>
                  Add Placeholder
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default PlaceholdersSettings;
