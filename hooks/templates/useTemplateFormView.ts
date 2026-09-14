"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import useTemplateForm from "@/hooks/templates/useTemplateForm";
import {
  useTemplateFormContext,
  type TemplateNavItem,
} from "@/context/TemplateFormContext";
import type { UseTemplateFormViewReturn } from "@/types/template";

const ELEMENT_TO_TAB: Record<string, TemplateNavItem> = {
  logo: "header",
  "invoice-title": "header",
  "invoice-number": "header",
  "bill-to-label": "header",
  "bill-to-name": "header",
  "bill-to-address": "header",
  "invoice-date-label": "header",
  "invoice-date-value": "header",
  "invoice-date": "header",
  "due-date-label": "header",
  "due-date-value": "header",
  "due-date": "header",
  "terms-label": "header",
  "terms-value": "header",
  terms: "header",
  footer: "header",

  table: "table",
  "table-header": "table",
  "table-body": "table",

  "subtotal-label": "total",
  subtotal: "total",
  "tax-label": "total",
  tax: "total",
  "discount-label": "total",
  "discount-row": "total",
  discount: "total",
  "previous-remaining": "total",
  "total-label": "total",
  total: "total",
  "balance-due": "total",

  "notes-label": "notes",
  notes: "notes",

  background: "general",
  paper: "general",
};

const ELEMENT_TO_SECTION_ID: Record<string, string> = {
  logo: "section-logo",
  "invoice-title": "section-invoice-title",
  "invoice-number": "section-invoice-number",
  "bill-to-label": "section-bill-to-label",
  "bill-to-name": "section-bill-to-name",
  "bill-to-address": "section-bill-to-address",
  "invoice-date-label": "section-invoice-date-label",
  "invoice-date-value": "section-invoice-date-value",
  "invoice-date": "section-invoice-date",
  "due-date-label": "section-due-date-label",
  "due-date-value": "section-due-date-value",
  "due-date": "section-due-date",
  "terms-label": "section-terms-label",
  "terms-value": "section-terms-value",
  terms: "section-terms",
  footer: "section-footer",

  table: "section-table-header",
  "table-header": "section-table-header",
  "table-body": "section-table-body",

  "subtotal-label": "section-subtotal-label",
  subtotal: "section-subtotal-label",
  "tax-label": "section-tax-label",
  tax: "section-tax-label",
  "discount-label": "section-discount-label",
  "discount-row": "section-discount-label",
  discount: "section-discount-label",
  "previous-remaining": "section-previous-remaining",
  "total-label": "section-total-label",
  total: "section-total-label",
  "balance-due": "section-balance-due",

  "notes-label": "section-notes-label",
  notes: "section-notes-label",

  background: "section-background",
  paper: "section-paper",
};

const ELEMENT_TO_PARENT_SECTION: Record<string, string> = {
  logo: "logo",
  "invoice-title": "invoice-title",
  "invoice-number": "invoice-number",
  "bill-to-label": "bill-to-label",
  "bill-to-name": "bill-to-name",
  "bill-to-address": "bill-to-address",
  "invoice-date-label": "invoice-date",
  "invoice-date-value": "invoice-date",
  "invoice-date": "invoice-date",
  "due-date-label": "due-date",
  "due-date-value": "due-date",
  "due-date": "due-date",
  "terms-label": "terms",
  "terms-value": "terms",
  terms: "terms",
  footer: "footer",

  table: "table-header",
  "table-header": "table-header",
  "table-body": "table-body",

  "subtotal-label": "subtotal-label",
  subtotal: "subtotal-label",
  "tax-label": "tax-label",
  tax: "tax-label",
  "discount-label": "discount-label",
  "discount-row": "discount-label",
  discount: "discount-label",
  "previous-remaining": "previous-remaining",
  "total-label": "total-label",
  total: "total-label",
  "balance-due": "balance-due",

  "notes-label": "notes-label",
  notes: "notes-label",
};

export const useTemplateFormView = (): UseTemplateFormViewReturn => {
  const params = useParams();
  const id = params?.id as string;

  const templateForm = useTemplateForm(id);
  const { handleLogoUpload, handleSelectElement, selectedElement } = templateForm;

  const { activeNav, setActiveNav, setIsTemplateFormActive } =
    useTemplateFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsTemplateFormActive(true);
    return () => setIsTemplateFormActive(false);
  }, [setIsTemplateFormActive]);

  const onLogoFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleLogoUpload(file);
      }
    },
    [handleLogoUpload],
  );

  const templateConfig = useMemo(
    () => ({
      ...templateForm.formData,
      branding: templateForm.branding,
      tableColumns: templateForm.tableColumns,
    }),
    [templateForm.formData, templateForm.branding, templateForm.tableColumns],
  );

  const paperDims = useMemo(() => {
    const paperSizes: Record<string, { width: string; height: string }> = {
      A4: { width: "210mm", height: "297mm" },
      A5: { width: "148mm", height: "210mm" },
      Letter: { width: "216mm", height: "279mm" },
    };
    const isLandscape = templateForm.formData.orientation === "Landscape";
    const paper =
      paperSizes[templateForm.formData.paperSize] || paperSizes["A4"];
    return {
      width: isLandscape ? paper.height : paper.width,
      height: isLandscape ? paper.width : paper.height,
    };
  }, [templateForm.formData.orientation, templateForm.formData.paperSize]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const isSectionOpen = useCallback(
    (key: string, isSelected = false) => {
      if (openSections[key] !== undefined) {
        return openSections[key];
      }
      return isSelected;
    },
    [openSections],
  );

  const toggleSection = useCallback(
    (key: string, isSelected = false) => {
      setOpenSections((prev) => ({
        ...prev,
        [key]: !(prev[key] !== undefined ? prev[key] : isSelected),
      }));
    },
    [],
  );

  const handlePreviewSelection = useCallback(
    (elementId: string) => {
      handleSelectElement(elementId);
      const targetNav = ELEMENT_TO_TAB[elementId];
      if (targetNav && targetNav !== activeNav) {
        setActiveNav(targetNav);
      }
      const parentSection = ELEMENT_TO_PARENT_SECTION[elementId] || elementId;
      setOpenSections((prev) => ({
        ...prev,
        [parentSection]: true,
      }));
    },
    [handleSelectElement, activeNav, setActiveNav],
  );

  useEffect(() => {
    if (selectedElement) {
      const timer = setTimeout(() => {
        const targetId =
          ELEMENT_TO_SECTION_ID[selectedElement] || `section-${selectedElement}`;
        let element = document.getElementById(targetId);
        if (!element) {
          const parentSection = ELEMENT_TO_PARENT_SECTION[selectedElement];
          if (parentSection) {
            element = document.getElementById(`section-${parentSection}`);
          }
        }
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedElement, activeNav]);

  return {
    ...templateForm,
    activeNav,
    setActiveNav,
    fileInputRef,
    onLogoFileChange,
    templateConfig,
    paperDims,
    isSectionOpen,
    toggleSection,
    handlePreviewSelection,
  };
};

export default useTemplateFormView;
