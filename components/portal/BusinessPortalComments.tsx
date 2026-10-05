"use client";

import React, { useRef, useState } from "react";
import useSWR from "swr";
import axios from "@/lib/axios";
import { swrFetcher } from "@/lib/swr";
import { Button, Checkbox, toast } from "@/components/ui";
import CommentBody from "./CommentBody";
import type { PortalComment } from "@/types/portal";

const TOOLS = [
  { command: "bold", label: "B", title: "Bold", className: "font-bold" },
  { command: "italic", label: "I", title: "Italic", className: "italic" },
  { command: "underline", label: "U", title: "Underline", className: "underline" },
] as const;

/**
 * Comments on an invoice, quote or project: a small formatting editor and the
 * conversation with the customer through the portal ("All comments").
 */
const BusinessPortalComments: React.FC<{ entityType: "invoice" | "quote" | "project"; entityId: number }> = ({
  entityType,
  entityId,
}) => {
  const key = `/portal-admin/comments?entityType=${entityType}&entityId=${entityId}`;
  const { data, mutate } = useSWR<{ comments: PortalComment[] }>(key, swrFetcher, {
    revalidateOnFocus: false,
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(true);
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);
  const comments = data?.comments || [];

  const refreshEmpty = () => setEmpty(!(editorRef.current?.textContent || "").trim());

  const format = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
    refreshEmpty();
  };

  const send = async () => {
    const editor = editorRef.current;
    if (!editor || !(editor.textContent || "").trim()) return;
    setBusy(true);
    try {
      await axios.post("/portal-admin/comments", {
        entityType,
        entityId,
        message: editor.innerHTML,
        visibleToCustomer: visible,
      });
      editor.innerHTML = "";
      setEmpty(true);
      await mutate();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to add comment", "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="overflow-hidden rounded-lg border border-slate-300/80 bg-white">
        <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-2">
          {TOOLS.map((t) => (
            <button
              key={t.command}
              type="button"
              title={t.title}
              // keep the selection in the editor while a tool is pressed
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => format(t.command)}
              className={`flex h-7 w-8 items-center justify-center rounded text-xs text-slate-700 hover:bg-white cursor-pointer ${t.className}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label="Write a comment"
            onInput={refreshEmpty}
            onPaste={(e) => {
              // paste as plain text so pasted styles don't leak into the comment
              e.preventDefault();
              document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
            }}
            className="min-h-[72px] px-4 py-3 text-sm text-slate-800 outline-none"
          />
          {empty && (
            <span className="pointer-events-none absolute left-4 top-3 text-sm text-slate-400">Write a comment...</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-2.5 py-2.5">
          <Button variant="outline" size="sm" onClick={send} loading={busy} disabled={busy || empty}>
            Add Comment
          </Button>
          <Checkbox label="Visible to customer" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
        </div>
      </div>

      <h3 className="mt-8 border-b border-slate-200 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
        All Comments
      </h3>

      {comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No comments yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {comments.map((c) => (
            <li key={c.id} className="py-4 text-sm">
              <p className="mb-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {c.authorType === "customer" ? c.authorName || "Customer" : "You"}
                </span>{" "}
                · {new Date(c.createdAt).toLocaleString()}
                {c.authorType === "business" && c.visibleToCustomer === false && " · Internal note"}
              </p>
              <CommentBody message={c.message} className="text-slate-800" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BusinessPortalComments;
