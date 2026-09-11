"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, Upload, GripVertical, Plus, Trash2 } from "lucide-react";
import useTemplateForm from "@/hooks/templates/useTemplateForm";
import { Button } from "@/components/ui";
import TemplatePreview from "./TemplatePreview";
import {
  useTemplateFormContext,
  type TemplateNavItem,
} from "@/context/TemplateFormContext";

const getSafeHex = (color: string) => {
  if (!color) return "#000000";
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)) {
    if (color.length === 4) {
      return (
        "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
      );
    }
    return color;
  }
  return "#000000";
};

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="flex items-center gap-2.5">
      <input
        type="color"
        value={getSafeHex(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-md border-2 border-gray-300 cursor-pointer shadow-sm hover:border-primary/50 transition-colors"
        title={value || "#000000"}
      />
      <input
        type="text"
        value={(value || "").toUpperCase()}
        onChange={(e) =>
          onChange(
            e.target.value.startsWith("#")
              ? e.target.value
              : `#${e.target.value}`,
          )
        }
        placeholder="#000000"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono text-gray-900 uppercase focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all"
      />
    </div>
  </div>
);

interface LabelStyleProps {
  label: string;
  textValue: string;
  textColor?: string;
  bgColor?: string;
  fontSize?: number;
  onTextChange: (val: string) => void;
  onTextColorChange?: (val: string) => void;
  onBgColorChange?: (val: string) => void;
  onFontSizeChange?: (val: number) => void;
  showColor?: boolean;
  showBg?: boolean;
  showSize?: boolean;
}

const LabelStyleEditor: React.FC<LabelStyleProps> = ({
  label,
  textValue,
  textColor = "#1f2937",
  bgColor = "transparent",
  fontSize = 10,
  onTextChange,
  onTextColorChange,
  onBgColorChange,
  onFontSizeChange,
  showColor = true,
  showBg = true,
  showSize = true,
}) => (
  <div className="space-y-3">
    <label className="block text-xs font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Text</label>
      <input
        type="text"
        value={textValue}
        onChange={(e) => onTextChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
      />
    </div>

    {showColor && onTextColorChange && (
      <ColorInput
        label="Color"
        value={textColor}
        onChange={(v) => onTextColorChange(v)}
      />
    )}

    {showBg && onBgColorChange && (
      <ColorInput
        label="Background"
        value={bgColor === "transparent" ? "#ffffff" : bgColor}
        onChange={(v) => onBgColorChange(v)}
      />
    )}

    {showSize && (
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Size (pt)</label>
        <input
          type="number"
          value={fontSize}
          onChange={(e) => onFontSizeChange?.(parseInt(e.target.value) || 10)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
        />
      </div>
    )}
  </div>
);

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  icon?: React.ReactNode;
  id?: string;
  isSelected?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  icon,
  id,
  isSelected = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) {
      setInternalIsOpen(true);
    }
  }, [defaultOpen]);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <div
      id={id}
      className={`border-b border-gray-200 transition-all duration-200 ${
        isSelected ? "bg-blue-50/50 ring-2 ring-primary/40 rounded-sm" : ""
      }`}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span
            className={`text-sm transition-colors ${
              isSelected
                ? "font-semibold text-primary"
                : "font-medium text-gray-800"
            }`}
          >
            {title}
          </span>
        </div>
        <ChevronRight
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-90 text-primary" : ""
          }`}
        />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );
};

const TemplateForm: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;

  const {
    formData,
    handleChange,
    handleSubmit,
    loading,
    alert,
    dismissAlert,
    branding,
    setBrandName,
    setTagline,
    tableColumns,
    handleColumnChange,
    toggleColumn,
    addColumn,
    removeColumn,
    selectedElement,
    handleSelectElement,
    handleLogoUpload,
  } = useTemplateForm(id);

  const { activeNav, setActiveNav, setIsTemplateFormActive } =
    useTemplateFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsTemplateFormActive(true);
    return () => setIsTemplateFormActive(false);
  }, [setIsTemplateFormActive]);

  const onLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const templateConfig = {
    ...formData,
    branding,
    tableColumns,
  };

  const getPaperDimensions = () => {
    const paperSizes: Record<string, { width: string; height: string }> = {
      A4: { width: "210mm", height: "297mm" },
      A5: { width: "148mm", height: "210mm" },
      Letter: { width: "216mm", height: "279mm" },
    };
    const isLandscape = formData.orientation === "Landscape";
    const paper = paperSizes[formData.paperSize] || paperSizes["A4"];
    return {
      width: isLandscape ? paper.height : paper.width,
      height: isLandscape ? paper.width : paper.height,
    };
  };

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

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const isSectionOpen = (key: string, isSelected = false) => {
    if (openSections[key] !== undefined) {
      return openSections[key];
    }
    return isSelected;
  };

  const toggleSection = (key: string, isSelected = false) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !isSectionOpen(key, isSelected),
    }));
  };

  const handlePreviewSelection = (elementId: string) => {
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
  };

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

  const paperDims = getPaperDimensions();

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <aside className="w-[320px] bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Template Properties
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeNav === "general" && (
            <>
              <div className="px-4 py-4 border-b border-gray-200">
                <label className="block text-xs font-medium text-primary mb-1">
                  Template Name*
                </label>
                <input
                  type="text"
                  value={formData.templateName}
                  onChange={(e) => handleChange("templateName", e.target.value)}
                  placeholder="Standard Template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                />
              </div>

              <div className="px-4 py-4 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                  Paper Size
                  <span className="w-4 h-4 bg-gray-200 rounded-md text-xs flex items-center justify-center text-gray-500">
                    ?
                  </span>
                </label>
                <div className="flex gap-4">
                  {["A5", "A4", "Letter"].map((size) => (
                    <label
                      key={size}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="paperSize"
                        value={size}
                        checked={formData.paperSize === size}
                        onChange={(e) =>
                          handleChange("paperSize", e.target.value)
                        }
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-gray-800">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Orientation
                </label>
                <div className="flex gap-6">
                  {["Portrait", "Landscape"].map((orientation) => (
                    <label
                      key={orientation}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="orientation"
                        value={orientation}
                        checked={formData.orientation === orientation}
                        onChange={(e) =>
                          handleChange("orientation", e.target.value)
                        }
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-gray-800">
                        {orientation}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Margins <span className="text-primary">(in inches)</span>
                </label>
                <div className="space-y-3">
                  {(
                    [
                      { key: "marginTop", label: "Top" },
                      { key: "marginBottom", label: "Bottom" },
                      { key: "marginLeft", label: "Left" },
                      { key: "marginRight", label: "Right" },
                    ] as const
                  ).map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 block mb-1">
                        {label}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData[key] as number}
                        onChange={(e) =>
                          handleChange(key, parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 border-b border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showNotes}
                    onChange={(e) =>
                      handleChange("showNotes", e.target.checked)
                    }
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span className="text-sm text-gray-800">
                    Include Payment Stub
                  </span>
                  <span className="w-4 h-4 bg-gray-200 rounded-md text-xs flex items-center justify-center text-gray-500">
                    ?
                  </span>
                </label>
              </div>

              <CollapsibleSection title="Font" defaultOpen={false}>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Font Family
                    </label>
                    <select
                      value={formData.fontFamily || "Helvetica"}
                      onChange={(e) =>
                        handleChange("fontFamily", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                    >
                      <optgroup label="Sans-Serif">
                        <option value="Helvetica">Helvetica</option>
                        <option value="Arial">Arial</option>
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Nunito">Nunito</option>
                        <option value="Source Sans Pro">Source Sans Pro</option>
                        <option value="Ubuntu">Ubuntu</option>
                        <option value="Raleway">Raleway</option>
                        <option value="Oswald">Oswald</option>
                      </optgroup>
                      <optgroup label="Serif">
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Merriweather">Merriweather</option>
                        <option value="Playfair Display">
                          Playfair Display
                        </option>
                        <option value="Lora">Lora</option>
                        <option value="PT Serif">PT Serif</option>
                        <option value="Crimson Text">Crimson Text</option>
                      </optgroup>
                      <optgroup label="Monospace">
                        <option value="Courier New">Courier New</option>
                        <option value="Fira Code">Fira Code</option>
                        <option value="JetBrains Mono">JetBrains Mono</option>
                        <option value="Source Code Pro">Source Code Pro</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </CollapsibleSection>
            </>
          )}

          {activeNav === "header" && (
            <>
              <CollapsibleSection
                title="Logo"
                isOpen={isSectionOpen("logo", selectedElement === "logo")}
                onToggle={() => toggleSection("logo", selectedElement === "logo")}
                id="section-logo"
                isSelected={selectedElement === "logo"}
              >
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {branding.logoPreview ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={branding.logoPreview}
                        alt="Logo preview"
                        className="max-h-16 mx-auto"
                      />
                    ) : (
                      <>
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={24}
                        />
                        <p className="text-sm text-gray-600">
                          Click to upload logo
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onLogoFileChange}
                      className="hidden"
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        value={branding.brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={branding.tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Invoice Title"
                isOpen={isSectionOpen("invoice-title", selectedElement === "invoice-title")}
                onToggle={() => toggleSection("invoice-title", selectedElement === "invoice-title")}
                id="section-invoice-title"
                isSelected={selectedElement === "invoice-title"}
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Title Text
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceLabel}
                      onChange={(e) =>
                        handleChange("invoiceLabel", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                    />
                  </div>
                  <ColorInput
                    label="Title Color"
                    value={formData.primaryColor}
                    onChange={(v) => handleChange("primaryColor", v)}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Invoice Number"
                isOpen={isSectionOpen("invoice-number", selectedElement === "invoice-number")}
                onToggle={() => toggleSection("invoice-number", selectedElement === "invoice-number")}
                id="section-invoice-number"
                isSelected={selectedElement === "invoice-number"}
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Number Label
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumberLabel}
                      onChange={(e) =>
                        handleChange("invoiceNumberLabel", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                    />
                  </div>
                  <ColorInput
                    label="Number Color"
                    value={formData.invoiceNumberColor || "#1AA3FF"}
                    onChange={(v) => handleChange("invoiceNumberColor", v)}
                  />
                </div>
              </CollapsibleSection>

              <div className="px-4 py-4 border-b border-gray-200 space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showHeader}
                    onChange={(e) =>
                      handleChange("showHeader", e.target.checked)
                    }
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">Show Header</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showFooter}
                    onChange={(e) =>
                      handleChange("showFooter", e.target.checked)
                    }
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">Show Footer</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showLogo}
                    onChange={(e) => handleChange("showLogo", e.target.checked)}
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">Show Logo</span>
                </label>
              </div>

              <CollapsibleSection
                title="Bill To Label"
                isOpen={isSectionOpen("bill-to-label", selectedElement === "bill-to-label")}
                onToggle={() => toggleSection("bill-to-label", selectedElement === "bill-to-label")}
                id="section-bill-to-label"
                isSelected={selectedElement === "bill-to-label"}
              >
                <LabelStyleEditor
                  label="Bill To Label"
                  textValue={formData.billToLabel}
                  onTextChange={(v) => handleChange("billToLabel", v)}
                  showColor={false}
                  showBg={false}
                  showSize={false}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Invoice Date"
                isOpen={isSectionOpen(
                  "invoice-date",
                  selectedElement === "invoice-date-label" ||
                    selectedElement === "invoice-date-value" ||
                    selectedElement === "invoice-date",
                )}
                onToggle={() =>
                  toggleSection(
                    "invoice-date",
                    selectedElement === "invoice-date-label" ||
                      selectedElement === "invoice-date-value" ||
                      selectedElement === "invoice-date",
                  )
                }
                id="section-invoice-date"
                isSelected={
                  selectedElement === "invoice-date-label" ||
                  selectedElement === "invoice-date-value" ||
                  selectedElement === "invoice-date"
                }
              >
                <div className="space-y-4">
                  <LabelStyleEditor
                    label="Label"
                    textValue={formData.invoiceDateLabel}
                    onTextChange={(v) => handleChange("invoiceDateLabel", v)}
                    showColor={false}
                    showBg={false}
                    showSize={false}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Due Date"
                isOpen={isSectionOpen(
                  "due-date",
                  selectedElement === "due-date-label" ||
                    selectedElement === "due-date-value" ||
                    selectedElement === "due-date",
                )}
                onToggle={() =>
                  toggleSection(
                    "due-date",
                    selectedElement === "due-date-label" ||
                      selectedElement === "due-date-value" ||
                      selectedElement === "due-date",
                  )
                }
                id="section-due-date"
                isSelected={
                  selectedElement === "due-date-label" ||
                  selectedElement === "due-date-value" ||
                  selectedElement === "due-date"
                }
              >
                <div className="space-y-4">
                  <LabelStyleEditor
                    label="Label"
                    textValue={formData.dueDateLabel}
                    onTextChange={(v) => handleChange("dueDateLabel", v)}
                    showColor={false}
                    showBg={false}
                    showSize={false}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Terms"
                isOpen={isSectionOpen(
                  "terms",
                  selectedElement === "terms-label" ||
                    selectedElement === "terms-value" ||
                    selectedElement === "terms",
                )}
                onToggle={() =>
                  toggleSection(
                    "terms",
                    selectedElement === "terms-label" ||
                      selectedElement === "terms-value" ||
                      selectedElement === "terms",
                  )
                }
                id="section-terms"
                isSelected={
                  selectedElement === "terms-label" ||
                  selectedElement === "terms-value" ||
                  selectedElement === "terms"
                }
              >
                <div className="space-y-4">
                  <LabelStyleEditor
                    label="Label"
                    textValue={formData.termsLabel}
                    onTextChange={(v) => handleChange("termsLabel", v)}
                    showColor={false}
                    showBg={false}
                    showSize={false}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Footer Settings"
                isOpen={isSectionOpen("footer", selectedElement === "footer")}
                onToggle={() => toggleSection("footer", selectedElement === "footer")}
                id="section-footer"
                isSelected={selectedElement === "footer"}
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Footer Text
                    </label>
                    <input
                      type="text"
                      value={formData.footerText || ""}
                      onChange={(e) =>
                        handleChange("footerText", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </>
          )}

          {activeNav === "table" && (
            <>
              <div className="px-4 py-3 border-b border-gray-200">
                <button
                  onClick={addColumn}
                  className="flex items-center gap-2 w-full py-2 px-3 border-2 border-dashed border-primary/40 rounded-md text-primary hover:bg-primary/5 transition-colors"
                >
                  <Plus size={16} />
                  <span className="text-sm font-medium">Add Column</span>
                </button>
              </div>

              <div className="px-4 py-3 space-y-2">
                {tableColumns.map((col, idx) => (
                  <div
                    key={col.key}
                    className={`border rounded-md p-3 ${
                      col.enabled
                        ? "bg-white border-gray-200"
                        : "bg-gray-50 border-gray-100 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical
                        size={14}
                        className="text-gray-400 cursor-move"
                      />
                      <input
                        type="checkbox"
                        checked={col.enabled}
                        onChange={() => toggleColumn(idx)}
                        className="rounded text-primary"
                      />
                      <span className="text-xs text-gray-600 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                        {col.key}
                      </span>
                      {![
                        "index",
                        "itemName",
                        "description",
                        "quantity",
                        "rate",
                        "amount",
                      ].includes(col.key) && (
                        <button
                          onClick={() => removeColumn(idx)}
                          className="ml-auto text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Label</label>
                        <input
                          type="text"
                          value={col.label}
                          onChange={(e) =>
                            handleColumnChange(idx, "label", e.target.value)
                          }
                          disabled={!col.enabled}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Width</label>
                        <input
                          type="number"
                          value={col.width}
                          onChange={(e) =>
                            handleColumnChange(
                              idx,
                              "width",
                              parseInt(e.target.value) || 50,
                            )
                          }
                          disabled={!col.enabled}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Align</label>
                        <select
                          value={col.align}
                          onChange={(e) =>
                            handleColumnChange(idx, "align", e.target.value)
                          }
                          disabled={!col.enabled}
                          className="w-full px-1 py-1 border border-gray-300 rounded text-xs text-gray-800"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <CollapsibleSection
                title="Table Header Style"
                isOpen={isSectionOpen("table-header", selectedElement === "table-header")}
                onToggle={() => toggleSection("table-header", selectedElement === "table-header")}
                id="section-table-header"
                isSelected={selectedElement === "table-header"}
              >
                <div className="space-y-3">
                  <ColorInput
                    label="Background"
                    value={formData.tableHeaderBgColor || "#1AA3FF"}
                    onChange={(v) => handleChange("tableHeaderBgColor", v)}
                  />
                  <ColorInput
                    label="Text Color"
                    value={formData.tableHeaderTextColor || "#ffffff"}
                    onChange={(v) => handleChange("tableHeaderTextColor", v)}
                  />
                </div>
              </CollapsibleSection>

              <div className="px-4 py-4 space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showTableHeader}
                    onChange={(e) =>
                      handleChange("showTableHeader", e.target.checked)
                    }
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">
                    Show Table Header
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.alternateRowColors}
                    onChange={(e) =>
                      handleChange("alternateRowColors", e.target.checked)
                    }
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">
                    Alternate Row Colors
                  </span>
                </label>
              </div>
            </>
          )}

          {activeNav === "total" && (
            <>
              <CollapsibleSection
                title="Subtotal Label"
                isOpen={isSectionOpen("subtotal-label", selectedElement === "subtotal-label")}
                onToggle={() => toggleSection("subtotal-label", selectedElement === "subtotal-label")}
                id="section-subtotal-label"
                isSelected={selectedElement === "subtotal-label"}
              >
                <LabelStyleEditor
                  label="Subtotal"
                  textValue={formData.subtotalLabel}
                  onTextChange={(v) => handleChange("subtotalLabel", v)}
                  showColor={false}
                  showBg={false}
                  showSize={false}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Tax Label"
                isOpen={isSectionOpen("tax-label", selectedElement === "tax-label")}
                onToggle={() => toggleSection("tax-label", selectedElement === "tax-label")}
                id="section-tax-label"
                isSelected={selectedElement === "tax-label"}
              >
                <LabelStyleEditor
                  label="Tax"
                  textValue={formData.taxLabel}
                  onTextChange={(v) => handleChange("taxLabel", v)}
                  showColor={false}
                  showBg={false}
                  showSize={false}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Discount Label"
                isOpen={isSectionOpen(
                  "discount-label",
                  selectedElement === "discount-label" ||
                    selectedElement === "discount-row" ||
                    selectedElement === "discount",
                )}
                onToggle={() =>
                  toggleSection(
                    "discount-label",
                    selectedElement === "discount-label" ||
                      selectedElement === "discount-row" ||
                      selectedElement === "discount",
                  )
                }
                id="section-discount-label"
                isSelected={
                  selectedElement === "discount-label" ||
                  selectedElement === "discount-row" ||
                  selectedElement === "discount"
                }
              >
                <LabelStyleEditor
                  label="Discount"
                  textValue={formData.discountLabel || "Discount"}
                  onTextChange={(v) => handleChange("discountLabel", v)}
                  showColor={false}
                  showBg={false}
                  showSize={false}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Previous Remaining"
                isOpen={isSectionOpen("previous-remaining", selectedElement === "previous-remaining")}
                onToggle={() => toggleSection("previous-remaining", selectedElement === "previous-remaining")}
                id="section-previous-remaining"
                isSelected={selectedElement === "previous-remaining"}
              >
                <LabelStyleEditor
                  label="Previous Remaining"
                  textValue={formData.previousDueLabel}
                  onTextChange={(v) => handleChange("previousDueLabel", v)}
                  showColor={false}
                  showBg={false}
                  showSize={false}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Total Label"
                isOpen={isSectionOpen("total-label", selectedElement === "total-label")}
                onToggle={() => toggleSection("total-label", selectedElement === "total-label")}
                id="section-total-label"
                isSelected={selectedElement === "total-label"}
              >
                <LabelStyleEditor
                  label="Total"
                  textValue={formData.totalLabel}
                  onTextChange={(v) => handleChange("totalLabel", v)}
                  showColor={false}
                  showBg={false}
                  showSize={false}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Balance Due Style"
                isOpen={isSectionOpen("balance-due", selectedElement === "balance-due")}
                onToggle={() => toggleSection("balance-due", selectedElement === "balance-due")}
                id="section-balance-due"
                isSelected={selectedElement === "balance-due"}
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Label Text
                    </label>
                    <input
                      type="text"
                      value={formData.balanceDueLabel}
                      onChange={(e) =>
                        handleChange("balanceDueLabel", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                    />
                  </div>
                  <ColorInput
                    label="Text Color"
                    value={formData.balanceDueTextColor || "#ffffff"}
                    onChange={(v) => handleChange("balanceDueTextColor", v)}
                  />
                  <ColorInput
                    label="Box Background"
                    value={formData.accentColor || "#1AA3FF"}
                    onChange={(v) => handleChange("accentColor", v)}
                  />
                </div>
              </CollapsibleSection>

              <div className="px-4 py-4 border-b border-gray-200 space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showSubtotal}
                    onChange={(e) =>
                      handleChange("showSubtotal", e.target.checked)
                    }
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">Show Subtotal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showTax}
                    onChange={(e) => handleChange("showTax", e.target.checked)}
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">Show Tax</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showDiscount}
                    onChange={(e) =>
                      handleChange("showDiscount", e.target.checked)
                    }
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">Show Discount</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showPreviousDue}
                    onChange={(e) =>
                      handleChange("showPreviousDue", e.target.checked)
                    }
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">
                    Show Previous Remaining
                  </span>
                </label>
              </div>
            </>
          )}

          {activeNav === "notes" && (
            <>
              <CollapsibleSection
                title="Notes Label"
                isOpen={isSectionOpen("notes-label", selectedElement === "notes-label")}
                onToggle={() => toggleSection("notes-label", selectedElement === "notes-label")}
                id="section-notes-label"
                isSelected={selectedElement === "notes-label"}
              >
                <LabelStyleEditor
                  label="Notes"
                  textValue={formData.notesLabel}
                  onTextChange={(v) => handleChange("notesLabel", v)}
                  showColor={false}
                  showBg={false}
                  showSize={false}
                />
              </CollapsibleSection>

              <div className="px-4 py-4 border-b border-gray-200 space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Visibility
                </h4>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showNotes}
                    onChange={(e) =>
                      handleChange("showNotes", e.target.checked)
                    }
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">
                    Show Notes Section
                  </span>
                </label>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 shrink-0">
          <Button
            onClick={() => handleSubmit(false)}
            loading={loading}
            variant="primary"
            className="w-full bg-primary text-white hover:bg-blue-700"
          >
            Save Template
          </Button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-100 overflow-auto flex justify-center items-start p-4">
        <div
          className="transition-all duration-300 shadow-2xl bg-white flex flex-col"
          style={{
            width: "100%",
            maxWidth: paperDims.width,
            minHeight: paperDims.height,
          }}
        >
          <TemplatePreview
            data={templateConfig}
            selectedElement={selectedElement}
            onSelectElement={handlePreviewSelection}
          />
        </div>
      </main>

      {alert.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center gap-3 ${
            alert.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : alert.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-primary/5 text-blue-800 border border-primary/30"
          }`}
        >
          <span>{alert.message}</span>
          <button
            onClick={dismissAlert}
            className="text-sm font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateForm;
