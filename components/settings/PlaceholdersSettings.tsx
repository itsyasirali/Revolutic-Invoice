"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import axios from "@/lib/axios";
import { PageHeader, toast } from "@/components/ui";
import useCustomPlaceholders from "@/hooks/common/useCustomPlaceholders";
import { PLACEHOLDER_DEFS, validateCustomKey } from "@/lib/placeholders/registry";

const inputCls =
  "w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-primary";

const PlaceholdersSettings: React.FC = () => {
  const { custom, mutate } = useCustomPlaceholders();
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async () => {
    const err = validateCustomKey(key);
    if (err) return toast.error(err, "Invalid key");
    if (!value.trim()) return toast.error("Value is required", "Invalid value");
    setSaving(true);
    try {
      await axios.post("/placeholders", { key, label, value });
      setKey("");
      setLabel("");
      setValue("");
      await mutate();
      toast.success("Placeholder added", "Saved");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to add placeholder", "Error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number, k: string) => {
    if (!window.confirm(`Delete %${k}%? Text that still uses it will show the raw token.`)) return;
    try {
      await axios.delete(`/placeholders/${id}`);
      await mutate();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete", "Error");
    }
  };

  const saveValue = async (id: number, current: string, next: string) => {
    if (next === current) return;
    try {
      await axios.put(`/placeholders/${id}`, { value: next });
      await mutate();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update", "Error");
      await mutate();
    }
  };

  return (
    <div className="pb-10">
      <PageHeader
        title="Placeholders"
        subtitle="Use %Name% in emails and invoice notes. Values are filled in when sent."
      />
      <div className="px-2 sm:px-4 md:px-6 mt-6 space-y-8 max-w-4xl">
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Custom placeholders</h2>
          <div className="grid gap-3 md:grid-cols-[180px_180px_1fr_auto] items-start mb-4">
            <input className={inputCls} placeholder="Key e.g. BankDetails" value={key} onChange={(e) => setKey(e.target.value)} />
            <input className={inputCls} placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
            <button onClick={add} disabled={saving} className="px-4 py-2 text-sm rounded-md bg-primary text-white disabled:opacity-50">
              Add
            </button>
          </div>
          {custom.length === 0 ? (
            <p className="text-sm text-gray-500">No custom placeholders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 border border-gray-200 rounded-md">
              {custom.map((c) => (
                <li key={c.id} className="flex items-start gap-3 p-3">
                  <code className="text-sm text-primary shrink-0 pt-2">%{c.key}%</code>
                  <textarea
                    key={c.value}
                    className={inputCls}
                    rows={2}
                    defaultValue={c.value}
                    onBlur={(e) => saveValue(c.id, c.value, e.target.value)}
                  />
                  <button onClick={() => remove(c.id, c.key)} className="p-2 text-gray-400 hover:text-red-600" aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Built-in placeholders</h2>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm">
            {PLACEHOLDER_DEFS.map((d) => (
              <li key={d.key} className="flex justify-between border border-gray-100 rounded-md px-3 py-2">
                <code className="text-gray-800">%{d.key}%</code>
                <span className="text-gray-500">{d.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PlaceholdersSettings;
