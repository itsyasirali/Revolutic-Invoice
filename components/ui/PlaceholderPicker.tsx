"use client";

import React, { useMemo } from "react";
import {
  PLACEHOLDER_DEFS,
  type PlaceholderScope,
  type CustomPlaceholderLike,
} from "@/lib/placeholders/registry";

interface Props {
  scope: PlaceholderScope;
  custom?: CustomPlaceholderLike[];
  onInsert: (token: string) => void;
}

const PlaceholderPicker: React.FC<Props> = ({ scope, custom = [], onInsert }) => {
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; label: string }[]>();
    for (const d of PLACEHOLDER_DEFS) {
      if (!d.scope.includes(scope)) continue;
      map.set(d.group, [...(map.get(d.group) ?? []), d]);
    }
    if (custom.length) {
      map.set(
        "Custom",
        custom.map((c) => ({ key: c.key, label: c.label || c.key })),
      );
    }
    return Array.from(map.entries());
  }, [scope, custom]);

  return (
    <select
      value=""
      onChange={(e) => e.target.value && onInsert(`%${e.target.value}%`)}
      className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:border-primary"
      aria-label="Insert placeholder"
    >
      <option value="">Insert placeholder…</option>
      {groups.map(([group, items]) => (
        <optgroup key={group} label={group}>
          {items.map((i) => (
            <option key={i.key} value={i.key}>
              {i.label} — %{i.key}%
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

export default PlaceholderPicker;
