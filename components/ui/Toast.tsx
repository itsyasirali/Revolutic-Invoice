"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import type { ToastType } from "@/types/common";
import useToastContainer, { toast } from "@/hooks/common/useToastContainer";

export { toast };

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-primary shrink-0" />,
};

const toastStyles: Record<ToastType, string> = {
  success: "bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10",
  error: "bg-white border-rose-200 text-slate-800 shadow-rose-500/10",
  warning: "bg-white border-amber-200 text-slate-800 shadow-amber-500/10",
  info: "bg-white border-slate-200 text-slate-800 shadow-primary/10",
};

const progressColors: Record<ToastType, string> = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-primary",
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastContainer();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[110] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto relative overflow-hidden flex flex-col rounded-lg border shadow-xl backdrop-blur-sm transition-all duration-300 animate-slide-up ${toastStyles[item.type]}`}
          role="alert"
        >
          <div className="flex items-start gap-3 p-4">
            {toastIcons[item.type]}
            <div className="flex-1 min-w-0">
              {item.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5 text-slate-900">
                  {item.title}
                </h4>
              )}
              <p className="text-sm font-medium text-slate-600 leading-snug break-words">
                {item.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar Line at Bottom */}
          <div className="w-full bg-slate-100/90 h-1 overflow-hidden">
            <div
              className={`h-full ${progressColors[item.type]}`}
              style={{
                animation: `toastProgress ${item.duration || 2000}ms linear forwards`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
