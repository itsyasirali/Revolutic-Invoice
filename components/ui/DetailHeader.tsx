"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Pencil, X } from "lucide-react";

export interface DetailMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Skip the entry entirely (e.g. an action that doesn't apply to this record). */
  hidden?: boolean;
}

interface DetailHeaderProps {
  title: React.ReactNode;
  /** Small line under the title (status badge, number, customer...). */
  subtitle?: React.ReactNode;
  /** Extra controls rendered just before the edit button. */
  actions?: React.ReactNode;
  onEdit?: () => void;
  editDisabled?: boolean;
  editTitle?: string;
  menu?: DetailMenuItem[];
  onClose: () => void;
}

/**
 * Header of a record's detail pane: title on the left; pencil (edit), "More"
 * dropdown and close on the right. Shared by every module's detail page.
 */
export const DetailHeader: React.FC<DetailHeaderProps> = ({
  title,
  subtitle,
  actions,
  onEdit,
  editDisabled,
  editTitle = "Edit",
  menu = [],
  onClose,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const items = menu.filter((m) => !m.hidden);

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-2xl text-slate-900">{title}</h1>
        {subtitle && <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">{subtitle}</div>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {actions}

        {onEdit && (
          <button
            type="button"
            aria-label={editTitle}
            title={editTitle}
            disabled={editDisabled}
            onClick={onEdit}
            className="flex h-8 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

        {items.length > 0 && (
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex h-8 items-center gap-1.5 rounded-md border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              More
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {(
              <div
                aria-hidden={!open}
                className={`absolute right-0 top-full z-30 mt-1.5 w-52 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg transition-all duration-300 ease-in-out ${
                  open
                    ? "opacity-100 visible [clip-path:inset(0_-24px_-24px_-24px)]"
                    : "opacity-0 invisible pointer-events-none [clip-path:inset(0_-24px_100%_-24px)]"
                }`}
              >
                {items.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    disabled={m.disabled}
                    onClick={() => {
                      setOpen(false);
                      m.onClick();
                    }}
                    className={`block w-full px-3.5 py-2 text-left text-sm cursor-pointer hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${
                      m.danger ? "text-rose-600" : "text-slate-700"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          aria-label="Close"
          title="Close"
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default DetailHeader;
