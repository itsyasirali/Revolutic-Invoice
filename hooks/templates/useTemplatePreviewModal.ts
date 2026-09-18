"use client";

import { useState } from "react";
import type {
  TemplateListItem,
  UseTemplatePreviewModalReturn,
} from "@/types/template";

const useTemplatePreviewModal = (): UseTemplatePreviewModalReturn => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDownload = async (template: TemplateListItem) => {
    const element = document.getElementById("pdf-print-area");
    if (!element) return;

    const clone = element.cloneNode(true) as HTMLElement;
    clone.classList.remove("hidden");
    clone.classList.add("block");
    clone.style.position = "relative";
    clone.style.width = "210mm";
    clone.style.height = "auto";

    const ths = clone.querySelectorAll("th");
    ths.forEach((th) => {
      (th as HTMLElement).style.padding = "2px 12px 15px 12px";
    });

    const tds = clone.querySelectorAll("td");
    tds.forEach((td) => {
      (td as HTMLElement).style.padding = "2px 12px 8px 12px";
    });

    const balanceBox = clone.querySelector("#balance-due-box");
    if (balanceBox) {
      (balanceBox as HTMLElement).style.padding = "2px 14px 15px 14px";
    }

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "210mm";
    container.appendChild(clone);
    document.body.appendChild(container);

    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin: 0,
      filename: `invoice-${template.name || "preview"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    html2pdf()
      .set(opt)
      .from(clone)
      .save()
      .then(() => {
        document.body.removeChild(container);
      });
  };

  return {
    sidebarOpen,
    toggleSidebar,
    handleDownload,
  };
};

export default useTemplatePreviewModal;
