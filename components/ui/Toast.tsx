"use client";

/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toast: ToastMessage) => void;

class ToastManager {
  private listeners: ToastListener[] = [];

  subscribe(listener: ToastListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  show(
    message: string,
    type: ToastType = "info",
    title?: string,
    duration = 4000,
  ) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };
    this.listeners.forEach((listener) => listener(toast));
  }

  success(message: string, title?: string, duration?: number) {
    this.show(message, "success", title, duration);
  }

  error(message: string, title?: string, duration?: number) {
    this.show(message, "error", title, duration);
  }

  warning(message: string, title?: string, duration?: number) {
    this.show(message, "warning", title, duration);
  }

  info(message: string, title?: string, duration?: number) {
    this.show(message, "info", title, duration);
  }
}

export const toast = new ToastManager();

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
  info: "bg-white border-primary/20 text-slate-800 shadow-primary/10",
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 4000);
    });

    return () => unsubscribe();
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-md border shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-up ${toastStyles[item.type]}`}
          role="alert"
        >
          {toastIcons[item.type]}
          <div className="flex-1 min-w-0">
            {item.title && (
              <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5 text-slate-900">
                {item.title}
              </h4>
            )}
            <p className="text-sm font-medium text-slate-700 leading-snug break-words">
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
      ))}
    </div>
  );
};

export default ToastContainer;
