"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Download,
  MoreHorizontal,
  RefreshCw,
  Upload,
} from "lucide-react";
import ImportButton from "@/components/import/ImportButton";
import type { ImportKind } from "@/lib/import/types";

/**
 * Which side submenus open on. "left" suits a menu at the right edge of a page
 * (list screens); "right" suits a menu in a narrow left panel (split view), where
 * opening left would run off the screen.
 */
export const ListMenuSideContext = createContext<"left" | "right">("left");

export interface ListMenuSort {
  options: { label: string; value: string }[];
  /** Active field and direction; null keeps the list's original order. */
  active: { value: string; dir: "asc" | "desc" } | null;
  onChange: (value: string) => void;
}

interface ListMenuProps {
  sort?: ListMenuSort;
  importKind?: ImportKind;
  importLabel?: string;
  onExport?: () => void;
  onRefresh?: () => void;
}

const ITEM =
  "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-slate-700 cursor-pointer hover:bg-primary hover:text-white";
const ICON = "h-4 w-4 shrink-0 text-primary group-hover:text-white";

const SubMenu: React.FC<{
  icon: React.ReactNode;
  label: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ icon, label, open, onOpen, onClose, onToggle, children }) => {
  const side = useContext(ListMenuSideContext);
  return (
  <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
    {/* Hover opens the submenu; click still toggles it (touch screens). */}
    <button type="button" className={`${ITEM} ${open ? "bg-primary text-white" : ""}`} onClick={onToggle}>
      {icon}
      <span className="flex-1">{label}</span>
      <ChevronRight className={`h-4 w-4 shrink-0 ${open ? "text-white" : "text-primary group-hover:text-white"}`} />
    </button>
    {/* Always mounted (only hidden) so the import file picker survives the menu closing. */}
    <div
      className={`absolute top-0 z-40 ${side === "right" ? "left-full pl-2" : "right-full pr-2"} ${
        open ? "block" : "hidden"
      }`}
    >
      <div className="w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">{children}</div>
    </div>
  </div>
  );
};

/**
 * "..." menu of a list screen: Sort by, Import, Export and Refresh List.
 */
export const ListMenu: React.FC<ListMenuProps> = ({ sort, importKind, importLabel, onExport, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<"sort" | "import" | "export" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSub(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    setSub(null);
  };
  const toggle = (name: "sort" | "import" | "export") => setSub((s) => (s === name ? null : name));
  const hover = (name: "sort" | "import" | "export") => ({
    onOpen: () => setSub(name),
    onClose: () => setSub((s) => (s === name ? null : s)),
    onToggle: () => toggle(name),
  });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="More actions"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <div
        className={`absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ${
          open ? "block" : "hidden"
        }`}
      >
        {sort && (
          <SubMenu icon={<ArrowUpDown className={ICON} />} label="Sort by" open={sub === "sort"} {...hover("sort")}>
            {sort.options.map((o) => {
              const active = sort.active?.value === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  className={`${ITEM} ${active ? "bg-primary/10 font-medium text-primary" : ""}`}
                  onClick={() => {
                    sort.onChange(o.value);
                    close();
                  }}
                >
                  <span className="flex-1">{o.label}</span>
                  {active &&
                    (sort.active?.dir === "asc" ? (
                      <ArrowUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <ArrowDown className="h-4 w-4 shrink-0" />
                    ))}
                </button>
              );
            })}
          </SubMenu>
        )}

        {importKind && (
          <SubMenu icon={<Download className={ICON} />} label="Import" open={sub === "import"} {...hover("import")}>
            <ImportButton
              kind={importKind}
              renderTrigger={(inputId, loading) => (
                <label
                  htmlFor={inputId}
                  className={`${ITEM} ${loading ? "pointer-events-none opacity-50" : ""}`}
                  onClick={close}
                >
                  {importLabel ?? "Import"}
                </label>
              )}
            />
          </SubMenu>
        )}

        {onExport && (
          <SubMenu icon={<Upload className={ICON} />} label="Export" open={sub === "export"} {...hover("export")}>
            <button
              type="button"
              className={ITEM}
              onClick={() => {
                close();
                onExport();
              }}
            >
              Export as CSV
            </button>
          </SubMenu>
        )}

        {onRefresh && (
          <>
            <div className="my-1.5 border-t border-slate-100" />
            <button
              type="button"
              className={ITEM}
              onMouseEnter={() => setSub(null)}
              onClick={() => {
                close();
                onRefresh();
              }}
            >
              <RefreshCw className={ICON} />
              <span className="flex-1">Refresh List</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ListMenu;
