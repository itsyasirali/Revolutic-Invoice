import { sanitizeHtml } from "@/lib/sanitizeHtml";

export interface PdfDoc {
  /** e.g. "Invoice", "Quote", "Payment Receipt" */
  kind: string;
  number: string;
  status?: string;
  fromName: string;
  fromEmail?: string | null;
  partyLabel: string;
  partyName: string;
  meta: [string, string][];
  headers: string[];
  /** Cells after the first column are right-aligned. */
  rows: string[][];
  totals: { label: string; value: string; strong?: boolean }[];
  /** Rich text (sanitized before use). */
  notes?: string | null;
  notesTitle?: string;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const cleanName = (s: string) => s.replace(/[\\/:*?"<>|]+/g, "").trim() || "Document";

/** Builds the document in memory and saves it as an A4 PDF (no print dialog). */
export const downloadPdf = async (doc: PdfDoc) => {
  const html2pdf = (await import("html2pdf.js")).default;

  const head = doc.headers
    .map((h, i) => `<th style="padding:8px 6px;text-align:${i === 0 ? "left" : "right"}">${esc(h)}</th>`)
    .join("");
  const body = doc.rows
    .map(
      (r) =>
        `<tr>${r
          .map(
            (c, i) =>
              `<td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;text-align:${i === 0 ? "left" : "right"}">${esc(c)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  const totals = doc.totals
    .map(
      (t) =>
        `<div style="display:flex;justify-content:space-between;padding:3px 0;${
          t.strong ? "border-top:1px solid #cbd5e1;margin-top:4px;padding-top:8px;font-weight:bold;font-size:14px" : "color:#475569"
        }"><span>${esc(t.label)}</span><span>${esc(t.value)}</span></div>`,
    )
    .join("");
  const meta = doc.meta
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<div style="display:flex;gap:12px;padding:2px 0"><span style="width:110px;color:#64748b">${esc(k)}</span><span>${esc(v)}</span></div>`,
    )
    .join("");

  const el = document.createElement("div");
  el.innerHTML = `
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#111;padding:24px;width:700px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
        <div>
          <h1 style="margin:0 0 4px;font-size:24px">${esc(doc.kind)}</h1>
          <div style="font-size:14px;font-weight:bold">${esc(doc.number)}</div>
          ${doc.status ? `<div style="margin-top:4px;color:#475569">${esc(doc.status)}</div>` : ""}
        </div>
        <div style="text-align:right">
          <div style="font-size:14px;font-weight:bold">${esc(doc.fromName)}</div>
          ${doc.fromEmail ? `<div style="color:#64748b">${esc(doc.fromEmail)}</div>` : ""}
        </div>
      </div>
      <div style="margin-bottom:16px">
        <div style="color:#64748b;text-transform:uppercase;font-size:10px;letter-spacing:.05em">${esc(doc.partyLabel)}</div>
        <div style="font-size:14px;font-weight:bold">${esc(doc.partyName)}</div>
      </div>
      <div style="margin-bottom:20px">${meta}</div>
      ${
        doc.rows.length
          ? `<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f1f5f9">${head}</tr></thead><tbody>${body}</tbody></table>`
          : ""
      }
      <div style="margin:16px 0 0 auto;width:280px">${totals}</div>
      ${
        doc.notes
          ? `<div style="margin-top:24px"><div style="color:#64748b;text-transform:uppercase;font-size:10px;letter-spacing:.05em;margin-bottom:4px">${esc(
              doc.notesTitle || "Notes",
            )}</div><div style="white-space:pre-wrap">${sanitizeHtml(doc.notes)}</div></div>`
          : ""
      }
    </div>`;

  await html2pdf()
    .set({
      margin: 10,
      filename: `${cleanName(`${doc.kind} ${doc.number}`)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(el)
    .save();
};
