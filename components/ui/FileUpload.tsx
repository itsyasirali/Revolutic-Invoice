"use client";

import React, { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

interface FileUploadProps {
  name: string;
  label?: string;
  accept?: string;
  hint?: string;
  disabled?: boolean;
  /** Link to an already saved file, shown under the control. */
  currentUrl?: string | null;
  currentLabel?: string;
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * Drop area for a single file. The real <input type="file" name={name}> stays
 * in the DOM, so it submits with the surrounding form (FormData) as usual.
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  name,
  label,
  accept,
  hint = "Click to upload or drag and drop",
  disabled,
  currentUrl,
  currentLabel = "View current file",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (f: File | null) => {
    setFile(f);
    if (!f && inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped || disabled || !inputRef.current) return;
    const dt = new DataTransfer();
    dt.items.add(dropped);
    inputRef.current.files = dt.files;
    setFile(dropped);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</span>
      )}

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-800">{file.name}</div>
            <div className="text-xs text-slate-500">{formatSize(file.size)}</div>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            onClick={() => pick(null)}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-slate-300 bg-white hover:border-primary/60 hover:bg-slate-50"
          }`}
        >
          <UploadCloud className={`h-7 w-7 ${dragging ? "text-primary" : "text-slate-400"}`} />
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
          </span>
          <span className="text-xs text-slate-400">{hint === "Click to upload or drag and drop" ? "One file" : hint}</span>
        </button>
      )}

      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <FileText className="h-3.5 w-3.5" />
          {currentLabel}
        </a>
      )}
    </div>
  );
};

export default FileUpload;
