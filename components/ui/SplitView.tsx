"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import { Checkbox, LoadingSpinner } from "@/components/ui";
import { ListMenuSideContext } from "@/components/ui/ListMenu";

export interface SplitRow {
  id: string | number;
  title: string;
  subtitle?: string;
  right?: string;
  muted?: boolean;
}

export interface SplitFilter {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

interface SplitViewProps {
  filter: SplitFilter;
  rows: SplitRow[];
  loading?: boolean;
  /** Id of the open record (from the URL). */
  selectedId?: string;
  onOpen: (id: string | number) => void;
  onNew: () => void;
  newLabel: string;
  /** Ready-made "..." menu (e.g. ListMenu); replaces `menu`. */
  moreMenu?: React.ReactNode;
  /** Items of the "..." menu. Always mounted, so import dialogs survive the menu closing. */
  menu?: (closeMenu: () => void) => React.ReactNode;
  selectedIds: (string | number)[];
  onSelectRow: (id: string, checked: boolean) => void;
  /** Buttons shown instead of the header while rows are ticked. */
  bulk?: React.ReactNode;
  emptyText?: string;
  /** Detail pane. */
  children: React.ReactNode;
  /** Keeps the detail pane's state per record (remounts on change). */
  detailKey?: string;
}

/** Closes the menu when clicking anywhere outside it. */
const useOutsideClose = (open: boolean, close: () => void) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);
  return ref;
};

export const MENU_ITEM_CLASS =
  "block w-full px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50";

/**
 * Master-detail layout: a compact record list on the left (filter dropdown,
 * "+" and "..." actions, checkbox rows) and the open record on the right.
 */
export const SplitView: React.FC<SplitViewProps> = ({
  filter,
  rows,
  loading,
  selectedId,
  onOpen,
  onNew,
  newLabel,
  menu,
  moreMenu,
  selectedIds,
  onSelectRow,
  bulk,
  emptyText = "No records found",
  children,
  detailKey,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fit the viewport exactly: whatever sits above (top bar, page padding) is measured,
  // so the split view never overflows the screen or makes the whole page scroll.
  const rootRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useLayoutEffect(() => {
    const fit = () => {
      const el = rootRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const below = el.parentElement ? parseFloat(getComputedStyle(el.parentElement).paddingBottom) || 0 : 0;
      setHeight(Math.max(480, Math.floor(window.innerHeight - top - below)));
    };
    fit();
    window.addEventListener("resize", fit);

    // The split view fills the screen, so the page itself must not scroll
    // (otherwise a second, page-level scrollbar appears next to the pane's).
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", fit);
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);
  const filterRef = useOutsideClose(filterOpen, () => setFilterOpen(false));
  const menuRef = useOutsideClose(menuOpen, () => setMenuOpen(false));

  const filterLabel = filter.options.find((o) => o.value === filter.value)?.label ?? filter.options[0]?.label;
  const ticked = new Set(selectedIds.map(String));

  return (
    <div
      ref={rootRef}
      style={height ? { height } : undefined}
      className="flex h-[calc(100vh-5rem)] min-h-[480px] border-t border-slate-200 bg-white"
    >
      {/* Left: record list */}
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-slate-200 lg:w-[360px]">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3.5">
          {selectedIds.length > 0 && bulk ? (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>
              <div className="flex gap-1.5">{bulk}</div>
            </div>
          ) : (
            <>
              <div ref={filterRef} className="relative min-w-0">
                <button
                  type="button"
                  onClick={() => setFilterOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-[17px] font-semibold text-slate-900 cursor-pointer"
                >
                  <span className="truncate">{filterLabel}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
                </button>
                {filterOpen && (
                  <div className="absolute left-0 top-full z-30 mt-1.5 w-52 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                    {filter.options.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        className={`${MENU_ITEM_CLASS} ${filter.value === o.value ? "bg-primary/10 font-medium text-primary" : ""}`}
                        onClick={() => {
                          filter.onChange(o.value);
                          setFilterOpen(false);
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label={newLabel}
                  title={newLabel}
                  onClick={onNew}
                  className="flex h-8 w-9 items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {moreMenu && <ListMenuSideContext.Provider value="right">{moreMenu}</ListMenuSideContext.Provider>}
                {!moreMenu && menu && (
                  <div ref={menuRef} className="relative">
                    <button
                      type="button"
                      aria-label="More actions"
                      onClick={() => setMenuOpen((o) => !o)}
                      className="flex h-8 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    <div
                      className={`absolute right-0 top-full z-30 mt-1.5 w-44 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg ${
                        menuOpen ? "block" : "hidden"
                      }`}
                    >
                      {menu(() => setMenuOpen(false))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="hide-scrollbar flex-1 overflow-y-auto">
          {loading && rows.length === 0 ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">{emptyText}</p>
          ) : (
            rows.map((r) => {
              const active = String(r.id) === String(selectedId);
              return (
                <div
                  key={r.id}
                  onClick={() => onOpen(r.id)}
                  className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 ${
                    active ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={ticked.has(String(r.id))}
                      onChange={(e) => onSelectRow(String(r.id), e.target.checked)}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm ${r.muted ? "text-slate-400" : "text-slate-800"}`}>{r.title}</div>
                    {r.subtitle && <div className="truncate text-xs text-slate-500">{r.subtitle}</div>}
                  </div>
                  {r.right && <div className="shrink-0 text-sm text-slate-800">{r.right}</div>}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Right: open record. Breadcrumbs of embedded detail pages are redundant here. */}
      <section
        key={detailKey}
        className="dropdown-scrollbar min-w-0 flex-1 overflow-y-auto overscroll-contain [&_nav[aria-label='Breadcrumb']]:hidden"
      >
        {children}
      </section>
    </div>
  );
};

export default SplitView;
