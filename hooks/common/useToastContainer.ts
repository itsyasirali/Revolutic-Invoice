"use client";

import { useState, useEffect } from "react";
import type { ToastType, ToastMessage, ToastListener } from "@/types/common";

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

const useToastContainer = () => {
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

  return {
    toasts,
    removeToast,
  };
};

export default useToastContainer;
