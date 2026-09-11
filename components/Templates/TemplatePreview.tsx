"use client";

import React, { useState, useEffect } from "react";
import axios from "@/lib/axios";

interface TableColumn {
  key: string;
  label: string;
  width: number;
  align: "left" | "center" | "right";
  enabled: boolean;
}

interface InvoiceItem {
  index: number;
  itemName: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface TemplateBranding {
  brandName?: string;
  tagline?: string;
  logoPreview?: string;
}

interface TableColumnSetting {
  columnName?: string;
  key?: string;
  label?: string;
  width?: string | number;
  alignment?: "left" | "center" | "right";
  visible?: boolean;
}

interface TemplateData {
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  invoiceNumberColor?: string;
  billToColor?: string;
  previousDueColor?: string;
  textColor?: string;
  footerBackgroundColor?: string;
  borderColor?: string;
  headerTextColor?: string;
  tableBorderColor?: string;
  tableHeaderBgColor?: string;
  tableHeaderTextColor?: string;
  tableRowColor?: string;
  tableAltRowColor?: string;
  invoiceDateLabelColor?: string;
  invoiceDateValueColor?: string;
  termsLabelColor?: string;
  termsValueColor?: string;
  dueDateLabelColor?: string;
  dueDateValueColor?: string;
  billToNameColor?: string;
  billToAddressColor?: string;
  balanceDueTextColor?: string;

  branding?: TemplateBranding;
  brandName?: string;
  tagline?: string;
  logoUrl?: string;
  showLogo?: boolean;

  fontFamily?: string;
  fontSize?: number | string;
  headingFontSize?: number | string;
  subheadingFontSize?: number | string;
  labelFontSize?: number | string;
  invoiceDetailLabelFontSize?: number | string;
  invoiceDetailValueFontSize?: number | string;
  billToNameFontSize?: number | string;
  billToAddressFontSize?: number | string;
  tableFontSize?: number | string;
  footerFontSize?: number | string;

  invoiceLabel?: string;
  billToLabel?: string;
  invoiceDateLabel?: string;
  termsLabel?: string;
  dueDateLabel?: string;
  itemsLabel?: string;
  quantityLabel?: string;
  rateLabel?: string;
  amountLabel?: string;
  subtotalLabel?: string;
  taxLabel?: string;
  discountLabel?: string;
  previousDueLabel?: string;
  totalLabel?: string;
  balanceDueLabel?: string;
  notesLabel?: string;
  footerText?: string;

  showInvoiceDate?: boolean;
  showDueDate?: boolean;
  showTableHeader?: boolean;
  alternateRowColors?: boolean;
  showSubtotal?: boolean;
  showTax?: boolean;
  showDiscount?: boolean;
  showPreviousDue?: boolean;
  showTotal?: boolean;
  showNotes?: boolean;
  showFooter?: boolean;

  marginTop?: number;
  marginRight?: number;
  marginLeft?: number;
  paperSize?: string;
  orientation?: string;
  backgroundColor?: string;

  tableColumns?: TableColumn[];
  tableColumnSettings?: TableColumnSetting[];
}

interface InvoiceItemData {
  title?: string;
  description?: string;
  quantity?: number | string;
  rate?: number | string;
  amount?: number | string;
  name?: string;
  item?: { name?: string };
  [key: string]: unknown;
}

interface CustomerData {
  displayName?: string;
  companyName?: string;
  address?: string;
}

interface InvoiceData {
  invoiceNumber?: string;
  invoiceDate?: string | Date;
  dueDate?: string | Date;
  formattedDueDate?: string;
  terms?: string;
  customerDisplayName?: string;
  customerId?: CustomerData;
  customer?: CustomerData;
  customerAddress?: string;
  items?: InvoiceItemData[];
  subTotal?: number | string;
  subtotal?: number | string;
  previousRemaining?: number | string;
  remaining?: number | string;
  total?: number | string;
  currency?: string;
  notes?: string;
}

interface TemplatePreviewProps {
  data: TemplateData;
  invoice?: InvoiceData;
  selectedElement?: string;
  onSelectElement?: (element: string) => void;
  style?: React.CSSProperties;
  className?: string;
  footerStyle?: React.CSSProperties;
}

const SelectableElement: React.FC<{
  id: string;
  selectedElement?: string;
  onSelect?: (id: string) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}> = ({ id, selectedElement, onSelect, children, style, className }) => {
  const isSelected = !!onSelect && selectedElement === id;

  if (!onSelect) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      className={`cursor-pointer transition-all duration-150 rounded-sm ${
        isSelected
          ? "outline outline-2 outline-blue-500 outline-offset-2 ring-2 ring-blue-400/20"
          : "hover:outline hover:outline-1 hover:outline-blue-400/60 hover:outline-dashed"
      } ${className || ""}`}
      style={style}
      title={`Click to edit ${id}`}
    >
      {children}
    </div>
  );
};

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  data,
  invoice,
  selectedElement,
  onSelectElement,
  style,
  className,
  footerStyle,
}) => {
  const isValidColor = (color: unknown): color is string => {
    if (!color || typeof color !== "string") return false;
    if (color === "#") return false;
    return /^#([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(color);
  };

  const getColor = (val: string | undefined, defaultVal: string): string => {
    return isValidColor(val) ? val : defaultVal;
  };

  // Exact DB colors matched 1:1 to entities/Template.ts schema defaults
  const primaryColor = getColor(data.primaryColor, "#1AA3FF");
  const secondaryColor = getColor(data.secondaryColor, "#1AA3FF");
  const backgroundColor = getColor(data.backgroundColor, "#ffffff");
  const accentColor = getColor(data.accentColor, "#1AA3FF");
  const invoiceNumberColor = getColor(data.invoiceNumberColor, "#1AA3FF");
  const billToColor = getColor(data.billToColor, "#1AA3FF");
  const billToNameColor = getColor(data.billToNameColor, "#1AA3FF");
  const billToAddressColor = getColor(data.billToAddressColor, "#1AA3FF");
  const previousDueColor = getColor(data.previousDueColor, "#1AA3FF");
  const textColor = getColor(data.textColor, "#1f2937");
  const headerTextColor = getColor(data.headerTextColor, "#1AA3FF");
  const tableHeaderBgColor = getColor(data.tableHeaderBgColor, "#1AA3FF");
  const tableHeaderTextColor = getColor(data.tableHeaderTextColor, "#ffffff");
  const tableRowColor = getColor(data.tableRowColor, "#ffffff");
  const tableAltRowColor = getColor(data.tableAltRowColor, "#ffffff");
  const tableBorderColor = getColor(data.tableBorderColor, "#e5e7eb");
  const borderColor = getColor(data.borderColor, "#e5e7eb");
  const balanceDueTextColor = getColor(data.balanceDueTextColor, "#ffffff");
  const invoiceDateLabelColor = getColor(data.invoiceDateLabelColor, "#6b7280");
  const invoiceDateValueColor = getColor(data.invoiceDateValueColor, "#1f2937");
  const dueDateLabelColor = getColor(data.dueDateLabelColor, "#6b7280");
  const dueDateValueColor = getColor(data.dueDateValueColor, "#1f2937");
  const termsLabelColor = getColor(data.termsLabelColor, "#6b7280");
  const termsValueColor = getColor(data.termsValueColor, "#1f2937");
  const footerBackgroundColor = getColor(data.footerBackgroundColor, "#f9fafb");
  const grayText = "#6b7280";
  const darkText = textColor;

  const [dbInvoice, setDbInvoice] = useState<InvoiceData | null>(null);

  useEffect(() => {
    if (invoice) return;
    axios
      .get("/invoices")
      .then((res) => {
        const invoices =
          res.data?.invoices || (Array.isArray(res.data) ? res.data : []);
        if (invoices && invoices.length > 0) {
          setDbInvoice(invoices[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch invoice from DB for preview:", err);
      });
  }, [invoice]);

  const effectiveInvoice = invoice || dbInvoice;

  const branding = {
    brandName: data.branding?.brandName ?? data.brandName ?? "",
    tagline: data.branding?.tagline ?? data.tagline ?? "",
    logoPreview:
      data.branding?.logoPreview ||
      (data.logoUrl
        ? data.logoUrl.startsWith("http")
          ? data.logoUrl
          : `/${data.logoUrl.replace(/^\//, "")}`
        : ""),
  };

  const DEFAULT_COLUMNS: TableColumn[] = [
    { key: "index", label: "#", width: 30, align: "left", enabled: true },
    {
      key: "itemName",
      label: data.itemsLabel ?? "",
      width: 200,
      align: "left",
      enabled: true,
    },
    {
      key: "quantity",
      label: data.quantityLabel ?? "",
      width: 50,
      align: "center",
      enabled: true,
    },
    { key: "rate", label: data.rateLabel ?? "", width: 60, align: "right", enabled: true },
    {
      key: "amount",
      label: data.amountLabel ?? "",
      width: 70,
      align: "right",
      enabled: true,
    },
  ];

  const getTableColumns = (): TableColumn[] => {
    if (data.tableColumns) return data.tableColumns;

    const settings = data.tableColumnSettings;
    if (settings && Array.isArray(settings) && settings.length > 0) {
      const merged = DEFAULT_COLUMNS.map((defCol) => {
        const saved = settings.find((c: TableColumnSetting) => {
          const key = c.columnName || c.key;
          if (key === defCol.key) return true;
          if (
            defCol.key === "itemName" &&
            (key === "name" || key === "item" || key === "description")
          )
            return true;
          return false;
        });
        if (saved) {
          return {
            ...defCol,
            label: saved.label ?? defCol.label,
            width:
              typeof saved.width === "string"
                ? parseInt(saved.width) || defCol.width
                : (saved.width as number) || defCol.width,
            align: saved.alignment || defCol.align,
            enabled: saved.visible !== false,
          };
        }
        return { ...defCol, enabled: false };
      });

      const custom = settings
        .filter((c: TableColumnSetting) => {
          const key = c.columnName || c.key;
          const normalizedKey =
            key === "name" || key === "item" || key === "description"
              ? "itemName"
              : key;
          return !DEFAULT_COLUMNS.find(
            (d) => d.key === key || d.key === normalizedKey,
          );
        })
        .map((c: TableColumnSetting) => ({
          key: c.columnName || c.key || `col-${Math.random()}`,
          label: c.label || "",
          width:
            typeof c.width === "string"
              ? parseInt(c.width) || 100
              : (c.width as number) || 100,
          align: c.alignment || "left",
          enabled: c.visible !== false,
        }));

      return [...merged, ...custom];
    }

    return DEFAULT_COLUMNS;
  };

  const tableColumns = getTableColumns();
  const enabledColumns = tableColumns.filter((col) => col.enabled);

  const activeInvoice = effectiveInvoice
    ? {
        number: effectiveInvoice.invoiceNumber ?? "",
        date: effectiveInvoice.invoiceDate
          ? new Date(effectiveInvoice.invoiceDate).toLocaleDateString(
              "en-US",
              { day: "numeric", month: "short", year: "numeric" },
            )
          : "",
        dueDate:
          effectiveInvoice.formattedDueDate ||
          (effectiveInvoice.dueDate
            ? new Date(effectiveInvoice.dueDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : ""),
        terms: effectiveInvoice.terms ?? "",
        client: {
          name:
            effectiveInvoice.customerDisplayName ||
            effectiveInvoice.customerId?.displayName ||
            effectiveInvoice.customerId?.companyName ||
            effectiveInvoice.customer?.displayName ||
            effectiveInvoice.customer?.companyName ||
            "",
          address:
            effectiveInvoice.customerAddress ||
            effectiveInvoice.customerId?.address ||
            effectiveInvoice.customer?.address ||
            "",
        },
        items: (effectiveInvoice.items || []).map(
          (item: InvoiceItemData, index: number) => ({
            ...item,
            index: index + 1,
            itemName: item.title || item.item?.name || item.name || "",
            description: item.description || "",
            quantity: Number(item.quantity) || 0,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0,
          }),
        ),
        subtotal: Number(
          effectiveInvoice.subTotal || effectiveInvoice.subtotal || 0,
        ),
        previousRemaining: Number(effectiveInvoice.previousRemaining || 0),
        total:
          effectiveInvoice.remaining !== undefined
            ? Number(effectiveInvoice.remaining)
            : Number(effectiveInvoice.total || 0) +
              Number(effectiveInvoice.previousRemaining || 0),
        currency: effectiveInvoice.currency ?? "",
        notes: effectiveInvoice.notes ?? "",
      }
    : {
        number: "",
        date: "",
        dueDate: "",
        terms: "",
        client: {
          name: "",
          address: "",
        },
        items: [],
        subtotal: 0,
        previousRemaining: 0,
        total: 0,
        currency: "",
        notes: "",
      };

  const formatCurrency = (amount: number): string => {
    return activeInvoice.currency
      ? `${amount.toFixed(2)} ${activeInvoice.currency}`
      : `${amount.toFixed(2)}`;
  };

  const getCellValue = (item: any, key: string): React.ReactNode => {
    switch (key) {
      case "index":
        return item.index ?? "";
      case "itemName":
        return item.itemName ?? "";
      case "description":
        return item.description ?? "";
      case "quantity":
        return item.quantity !== undefined && item.quantity !== null
          ? Number(item.quantity).toFixed(2)
          : "";
      case "rate":
        return item.rate !== undefined && item.rate !== null ? item.rate : "";
      case "amount":
        return item.amount !== undefined && item.amount !== null
          ? Number(item.amount).toFixed(2)
          : "";
      default: {
        const val = item[key];
        if (val === undefined || val === null) return "";
        if (typeof val === "object") return "";
        return String(val);
      }
    }
  };

  const marginTop = (data.marginTop || 0.5) * 72;
  const marginRight = (data.marginRight || 0.4) * 72;
  const marginLeft = (data.marginLeft || 0.4) * 72;

  const paperSizes: Record<string, { width: string; height: string }> = {
    A4: { width: "210mm", height: "296mm" },
    A5: { width: "148mm", height: "209mm" },
    Letter: { width: "216mm", height: "278mm" },
  };
  const paperSize = data.paperSize || "A4";
  const orientation = data.orientation || "Portrait";
  const isLandscape = orientation === "Landscape";
  const paper = paperSizes[paperSize] || paperSizes["A4"];
  const minHeight = isLandscape ? paper.width : paper.height;

  return (
    <div
      onClick={() => onSelectElement?.("")}
      className={`w-full flex flex-col ${className || ""}`}
      style={{
        backgroundColor: backgroundColor,
        fontFamily: data.fontFamily || "Helvetica, Arial, sans-serif",
        fontSize: `${data.fontSize || 10}pt`,
        color: textColor,
        minHeight: minHeight,
        ...style,
      }}
    >
      <div
        className="flex-grow flex flex-col"
        style={{
          padding: `${marginTop}px ${marginRight}px 20px ${marginLeft}px`,
        }}
      >
        <div
          className="flex justify-between items-center"
          style={{ marginBottom: "32px" }}
        >
          <SelectableElement
            id="logo"
            selectedElement={selectedElement}
            onSelect={onSelectElement}
          >
            {data.showLogo !== false &&
              (branding.logoPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  id="logo-preview"
                  src={branding.logoPreview}
                  alt="Logo"
                  className="max-w-[180px] max-h-[60px]"
                />
              ) : (
                <div id="logo-placeholder">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        backgroundColor: secondaryColor,
                      }}
                    >
                      R
                    </div>
                    <span
                      style={{
                        fontSize: `${data.headingFontSize || 24}pt`,
                        fontWeight: "bold",
                        color: headerTextColor,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {branding.brandName}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "9pt",
                      color: primaryColor,
                      marginTop: "2px",
                      marginLeft: "40px",
                    }}
                  >
                    {branding.tagline}
                  </div>
                </div>
              ))}
          </SelectableElement>

          <div className="flex flex-col items-end">
            <SelectableElement
              id="invoice-title"
              selectedElement={selectedElement}
              onSelect={onSelectElement}
              style={{ textAlign: "right" }}
            >
              <h1
                style={{
                  fontSize: `${data.headingFontSize || 28}pt`,
                  fontWeight: "bold",
                  color: invoiceNumberColor,
                  margin: 0,
                  letterSpacing: "1px",
                }}
              >
                {data.invoiceLabel ?? ""}
              </h1>
            </SelectableElement>
            <SelectableElement
              id="invoice-number"
              selectedElement={selectedElement}
              onSelect={onSelectElement}
              style={{ textAlign: "right" }}
            >
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: `${data.subheadingFontSize || 11}pt`,
                  color: invoiceNumberColor,
                  fontWeight: 600,
                }}
              >
                {activeInvoice.number}
              </p>
            </SelectableElement>
          </div>
        </div>

        <div className="flex flex-col" style={{ marginBottom: "32px" }}>
          <div className="flex justify-between items-start mb-2">
            <SelectableElement
              id="bill-to-label"
              selectedElement={selectedElement}
              onSelect={onSelectElement}
            >
              <h3
                className="font-bold m-0"
                style={{
                  fontSize: `${data.labelFontSize || 12}pt`,
                  color: billToColor,
                }}
              >
                {data.billToLabel ?? ""}
              </h3>
            </SelectableElement>

            <div className="flex flex-col items-end min-w-[220px]">
              {data.showInvoiceDate !== false && (
                <div className="flex justify-between items-center w-full gap-4">
                  <SelectableElement
                    id="invoice-date-label"
                    selectedElement={selectedElement}
                    onSelect={onSelectElement}
                  >
                    <span
                      style={{
                        fontSize: `${data.invoiceDetailLabelFontSize || 10}pt`,
                        color: invoiceDateLabelColor,
                      }}
                    >
                      {data.invoiceDateLabel ? `${data.invoiceDateLabel} :` : ""}
                    </span>
                  </SelectableElement>
                  <SelectableElement
                    id="invoice-date-value"
                    selectedElement={selectedElement}
                    onSelect={onSelectElement}
                  >
                    <span
                      style={{
                        fontSize: `${data.invoiceDetailValueFontSize || 10}pt`,
                        fontWeight: "bold",
                        color: invoiceDateValueColor,
                      }}
                    >
                      {activeInvoice.date}
                    </span>
                  </SelectableElement>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-start mb-1">
            <SelectableElement
              id="bill-to-name"
              selectedElement={selectedElement}
              onSelect={onSelectElement}
            >
              <div
                style={{
                  fontSize: `${data.billToNameFontSize || 12}pt`,
                  color: billToNameColor,
                  fontWeight: 600,
                }}
              >
                {activeInvoice.client.name}
              </div>
            </SelectableElement>

            <div className="flex flex-col items-end min-w-[220px]">
              <div className="flex justify-between items-center w-full gap-4">
                <SelectableElement
                  id="terms-label"
                  selectedElement={selectedElement}
                  onSelect={onSelectElement}
                >
                  <span
                    style={{
                      fontSize: `${data.invoiceDetailLabelFontSize || 10}pt`,
                      color: termsLabelColor,
                    }}
                  >
                    {data.termsLabel ? `${data.termsLabel} :` : ""}
                  </span>
                </SelectableElement>
                <SelectableElement
                  id="terms-value"
                  selectedElement={selectedElement}
                  onSelect={onSelectElement}
                >
                  <span
                    style={{
                      fontSize: `${data.invoiceDetailValueFontSize || 10}pt`,
                      fontWeight: "bold",
                      color: termsValueColor,
                    }}
                  >
                    {activeInvoice.terms}
                  </span>
                </SelectableElement>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <SelectableElement
              id="bill-to-address"
              selectedElement={selectedElement}
              onSelect={onSelectElement}
              className="max-w-[50%]"
            >
              <div
                style={{
                  fontSize: `${data.billToAddressFontSize || 10}pt`,
                  color: billToAddressColor,
                }}
              >
                {activeInvoice.client.address}
              </div>
            </SelectableElement>

            <div className="flex flex-col items-end min-w-[220px]">
              {data.showDueDate !== false && (
                <div className="flex justify-between items-center w-full gap-4">
                  <SelectableElement
                    id="due-date-label"
                    selectedElement={selectedElement}
                    onSelect={onSelectElement}
                  >
                    <span
                      style={{
                        fontSize: `${data.invoiceDetailLabelFontSize || 10}pt`,
                        color: dueDateLabelColor,
                      }}
                    >
                      {data.dueDateLabel ? `${data.dueDateLabel} :` : ""}
                    </span>
                  </SelectableElement>
                  <SelectableElement
                    id="due-date-value"
                    selectedElement={selectedElement}
                    onSelect={onSelectElement}
                  >
                    <span
                      style={{
                        fontSize: `${data.invoiceDetailValueFontSize || 10}pt`,
                        fontWeight: "bold",
                        color: dueDateValueColor,
                      }}
                    >
                      {activeInvoice.dueDate}
                    </span>
                  </SelectableElement>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-5" style={{ marginBottom: "20px" }}>
          <table className="w-full border-collapse">
            {data.showTableHeader !== false && (
              <thead
                id="table-head"
                onClick={(e) => {
                  if (onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("table-header");
                  }
                }}
                className={`transition-all duration-150 ${
                  onSelectElement ? "cursor-pointer" : ""
                } ${
                  onSelectElement && selectedElement === "table-header"
                    ? "outline outline-2 outline-blue-500 outline-offset-1 ring-2 ring-blue-400/20"
                    : onSelectElement
                    ? "hover:outline hover:outline-1 hover:outline-blue-400/60 hover:outline-dashed"
                    : ""
                }`}
                title={onSelectElement ? "Click to edit Table Header" : undefined}
              >
                <tr
                  style={{
                    backgroundColor: tableHeaderBgColor,
                  }}
                >
                  {enabledColumns.map((col) => (
                    <th
                      key={col.key}
                      className="p-0"
                      style={{ width: `${col.width}px` }}
                    >
                      <div
                        className="font-bold block"
                        style={{
                          padding: "7px 9px",
                          textAlign: col.align,
                          color: tableHeaderTextColor,
                          fontSize: `${data.tableFontSize || 10}pt`,
                        }}
                      >
                        {col.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody
              id="table-body"
              onClick={(e) => {
                if (onSelectElement) {
                  e.stopPropagation();
                  onSelectElement("table-body");
                }
              }}
              className={`transition-all duration-150 ${
                onSelectElement ? "cursor-pointer" : ""
              } ${
                onSelectElement && selectedElement === "table-body"
                  ? "outline outline-2 outline-blue-500 outline-offset-1 ring-2 ring-blue-400/20"
                  : onSelectElement
                  ? "hover:outline hover:outline-1 hover:outline-blue-400/60 hover:outline-dashed"
                  : ""
              }`}
              title={onSelectElement ? "Click to edit Table Body" : undefined}
            >
              {activeInvoice.items.map((item: InvoiceItem, i: number) => (
                <tr
                  key={i}
                  style={{
                    breakInside: "avoid",
                    backgroundColor:
                      data.alternateRowColors !== false && i % 2 === 1
                        ? tableAltRowColor
                        : tableRowColor,
                    borderBottom: `1px solid ${tableBorderColor}`,
                  }}
                >
                  {enabledColumns.map((col) => (
                    <td
                      key={col.key}
                      className="p-0"
                      style={{ width: `${col.width}px` }}
                    >
                      <div
                        className="block"
                        style={{
                          padding: "10px 12px",
                          fontSize: `${data.tableFontSize || 10}pt`,
                          color: textColor,
                          textAlign: col.align,
                        }}
                      >
                        {getCellValue(item, col.key)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end" style={{ marginBottom: "32px" }}>
          <div className="w-[260px]">
            {data.showSubtotal !== false && (
              <SelectableElement
                id="subtotal-label"
                selectedElement={selectedElement}
                onSelect={onSelectElement}
              >
                <div className="flex justify-between py-2">
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 11}pt`,
                      color: grayText,
                    }}
                  >
                    {data.subtotalLabel ?? ""}
                  </span>
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 11}pt`,
                      fontWeight: "bold",
                      color: darkText,
                    }}
                  >
                    {formatCurrency(activeInvoice.subtotal)}
                  </span>
                </div>
              </SelectableElement>
            )}

            {data.showTax && (
              <SelectableElement
                id="tax-label"
                selectedElement={selectedElement}
                onSelect={onSelectElement}
              >
                <div className="flex justify-between py-1.5">
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 10}pt`,
                      color: grayText,
                    }}
                  >
                    {data.taxLabel ?? ""}
                  </span>
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 10}pt`,
                      color: darkText,
                    }}
                  >
                    {formatCurrency(0)}
                  </span>
                </div>
              </SelectableElement>
            )}

            {data.showDiscount && (
              <SelectableElement
                id="discount-label"
                selectedElement={selectedElement}
                onSelect={onSelectElement}
              >
                <div
                  id="discount-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                  }}
                >
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 10}pt`,
                      color: grayText,
                    }}
                  >
                    {data.discountLabel ?? ""}
                  </span>
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 10}pt`,
                      color: darkText,
                    }}
                  >
                    -{formatCurrency(0)}
                  </span>
                </div>
              </SelectableElement>
            )}

            {data.showPreviousDue !== false && (
              <SelectableElement
                id="previous-remaining"
                selectedElement={selectedElement}
                onSelect={onSelectElement}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 10}pt`,
                      color: grayText,
                    }}
                  >
                    {data.previousDueLabel ?? ""}
                  </span>
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 10}pt`,
                      color: previousDueColor,
                    }}
                  >
                    {formatCurrency(activeInvoice.previousRemaining)}
                  </span>
                </div>
              </SelectableElement>
            )}

            {data.showTotal !== false && (
              <SelectableElement
                id="total-label"
                selectedElement={selectedElement}
                onSelect={onSelectElement}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                  }}
                >
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 11}pt`,
                      fontWeight: "bold",
                      color: textColor,
                    }}
                  >
                    {data.totalLabel ?? ""}
                  </span>
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 11}pt`,
                      fontWeight: "bold",
                      color: accentColor,
                    }}
                  >
                    {formatCurrency(activeInvoice.total)}
                  </span>
                </div>
              </SelectableElement>
            )}

            <SelectableElement
              id="balance-due"
              selectedElement={selectedElement}
              onSelect={onSelectElement}
            >
              <div
                id="balance-due-box"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: accentColor,
                  padding: "10px 14px",
                  marginTop: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: `${data.labelFontSize || 11}pt`,
                    fontWeight: "bold",
                    color: balanceDueTextColor,
                  }}
                >
                  {data.balanceDueLabel ?? ""}
                </span>
                <span
                  style={{
                    fontSize: `${data.labelFontSize || 13}pt`,
                    fontWeight: "bold",
                    color: balanceDueTextColor,
                  }}
                >
                  {formatCurrency(activeInvoice.total)}
                </span>
              </div>
            </SelectableElement>
          </div>
        </div>

        {data.showNotes !== false && (
          <SelectableElement
            id="notes-label"
            selectedElement={selectedElement}
            onSelect={onSelectElement}
            style={{ marginBottom: "30px" }}
          >
            <h3
              style={{
                fontSize: `${data.labelFontSize || 13}pt`,
                fontWeight: "bold",
                color: darkText,
                margin: "0 0 8px 0",
                paddingBottom: "4px",
                display: "inline-block",
              }}
            >
              {data.notesLabel ?? ""}
            </h3>
            <div
              id="notes-content"
              style={{
                fontSize: `${data.fontSize || 9}pt`,
                color: grayText,
                lineHeight: 1.6,
                marginTop: "12px",
              }}
              dangerouslySetInnerHTML={{ __html: activeInvoice.notes }}
            ></div>
          </SelectableElement>
        )}
      </div>

      {data.showFooter !== false && (
        <SelectableElement
          id="footer"
          selectedElement={selectedElement}
          onSelect={onSelectElement}
          style={{
            backgroundColor: footerBackgroundColor,
            borderTop: `1px solid ${borderColor}`,
            padding: "14px 20px",
            textAlign: "center" as const,
            flexShrink: 0,
            width: "100%",
            ...footerStyle,
          }}
        >
          <p
            style={{
              fontSize: `${data.footerFontSize || 9}pt`,
              color: textColor,
              margin: 0,
            }}
          >
            {data.footerText ?? ""}
          </p>
        </SelectableElement>
      )}
    </div>
  );
};

export default TemplatePreview;
