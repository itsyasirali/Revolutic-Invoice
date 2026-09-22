"use client";

import React from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import useCustomPlaceholders from "@/hooks/common/useCustomPlaceholders";
import { useProfile } from "@/hooks/auth/useProfile";
import { buildPlaceholderValues } from "@/lib/placeholders/context";
import { replacePlaceholders } from "@/lib/placeholders/replace";
import type {
  TemplatePreviewTableColumn,
  TemplatePreviewInvoiceItem,
  TemplatePreviewTableColumnSetting,
  TemplatePreviewInvoiceItemData,
  TemplatePreviewInvoiceData,
  TemplatePreviewProps,
} from "@/types/template";

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
      className={`cursor-pointer rounded-sm ${
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
  const { custom: customPlaceholders } = useCustomPlaceholders();
  const { user: profileUser } = useProfile();
  const isValidColor = (color: unknown): color is string => {
    if (!color || typeof color !== "string") return false;
    if (color === "#") return false;
    return /^#([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(color);
  };

  const getColor = (val: string | undefined, defaultVal: string): string => {
    return isValidColor(val) ? val : defaultVal;
  };

  // Dynamic colors strictly limited to user-allowed fields:
  const primaryColor = getColor(data.primaryColor, "#1AA3FF");
  const invoiceNumberColor = getColor(data.invoiceNumberColor, "#1AA3FF");
  const tableHeaderBgColor = getColor(data.tableHeaderBgColor, "#1AA3FF");
  const tableHeaderTextColor = getColor(data.tableHeaderTextColor, "#ffffff");
  const accentColor = getColor(data.accentColor, "#1AA3FF");
  const balanceDueTextColor = getColor(data.balanceDueTextColor, "#ffffff");

  // All other text and label colors are strictly static #1F2937:
  const staticTextColor = "#1F2937";
  const secondaryColor = "#1AA3FF";
  const backgroundColor = "#ffffff";
  const billToColor = staticTextColor;
  const billToNameColor = staticTextColor;
  const billToAddressColor = staticTextColor;
  const previousDueColor = staticTextColor;
  const textColor = staticTextColor;
  const headerTextColor = staticTextColor;
  const tableRowColor = "#ffffff";
  const tableAltRowColor = "#ffffff";
  const tableBorderColor = "#e5e7eb";
  const borderColor = "#e5e7eb";
  const invoiceDateLabelColor = staticTextColor;
  const invoiceDateValueColor = staticTextColor;
  const dueDateLabelColor = staticTextColor;
  const dueDateValueColor = staticTextColor;
  const termsLabelColor = staticTextColor;
  const termsValueColor = staticTextColor;
  const footerBackgroundColor = "#f9fafb";
  const grayText = staticTextColor;
  const darkText = staticTextColor;

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

  const DEFAULT_COLUMNS: TemplatePreviewTableColumn[] = [
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
    {
      key: "rate",
      label: data.rateLabel ?? "",
      width: 60,
      align: "right",
      enabled: true,
    },
    {
      key: "amount",
      label: data.amountLabel ?? "",
      width: 70,
      align: "right",
      enabled: true,
    },
  ];

  const getTableColumns = (): TemplatePreviewTableColumn[] => {
    if (data.tableColumns) return data.tableColumns;

    const settings = data.tableColumnSettings;
    if (settings && Array.isArray(settings) && settings.length > 0) {
      const merged = DEFAULT_COLUMNS.map((defCol) => {
        const saved = settings.find((c: TemplatePreviewTableColumnSetting) => {
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
        .filter((c: TemplatePreviewTableColumnSetting) => {
          const key = c.columnName || c.key;
          const normalizedKey =
            key === "name" || key === "item" || key === "description"
              ? "itemName"
              : key;
          return !DEFAULT_COLUMNS.find(
            (d) => d.key === key || d.key === normalizedKey,
          );
        })
        .map((c: TemplatePreviewTableColumnSetting) => ({
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

  const DUMMY_INVOICE_DATA = {
    number: "INV-000001",
    date: "Sep 11, 2026",
    dueDate: "Oct 11, 2026",
    terms: "Net 30",
    client: {
      name: "Rob & Joe Traders",
      address: "4141 Hacienda Drive, Pleasanton, 94588 CA, USA",
    },
    items: [
      {
        index: 1,
        itemName: "Web Development Services",
        description: "Custom software development, UI design and maintenance",
        quantity: 1,
        rate: 150,
        amount: 150,
      },
    ],
    subtotal: 150,
    previousRemaining: 0,
    writeOffAmount: 0,
    total: 150,
    currency: "USD",
    notes:
      "Thank you for your business. Please remit payment within 30 days via bank transfer.",
  };

  const activeInvoice = invoice
    ? {
        number: invoice.invoiceNumber ?? DUMMY_INVOICE_DATA.number,
        date: invoice.invoiceDate
          ? new Date(invoice.invoiceDate).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : DUMMY_INVOICE_DATA.date,
        dueDate:
          invoice.formattedDueDate ||
          (invoice.dueDate
            ? new Date(invoice.dueDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : DUMMY_INVOICE_DATA.dueDate),
        terms: invoice.terms ?? DUMMY_INVOICE_DATA.terms,
        client: {
          name:
            invoice.customerDisplayName ||
            invoice.customerId?.displayName ||
            invoice.customerId?.companyName ||
            invoice.customer?.displayName ||
            invoice.customer?.companyName ||
            DUMMY_INVOICE_DATA.client.name,
          address:
            invoice.customerAddress ||
            invoice.customerId?.address ||
            invoice.customer?.address ||
            DUMMY_INVOICE_DATA.client.address,
        },
        items:
          invoice.items && invoice.items.length > 0
            ? invoice.items.map((item: TemplatePreviewInvoiceItemData, index: number) => ({
                ...item,
                index: index + 1,
                itemName: item.title || item.item?.name || item.name || "",
                description: item.description || "",
                quantity: Number(item.quantity) || 0,
                rate: Number(item.rate) || 0,
                amount: Number(item.amount) || 0,
              }))
            : DUMMY_INVOICE_DATA.items,
        subtotal: Number(
          invoice.subTotal ?? invoice.subtotal ?? DUMMY_INVOICE_DATA.subtotal,
        ),
        previousRemaining: Number(
          invoice.previousRemaining ?? DUMMY_INVOICE_DATA.previousRemaining,
        ),
        writeOffAmount: (invoice.writeOffs || []).reduce(
          (sum: number, w: any) => sum + (w.reversedAt ? 0 : Number(w.amount || 0)),
          0,
        ),
        total:
          invoice.remaining !== undefined
            ? Number(invoice.remaining)
            : invoice.total !== undefined
              ? Number(invoice.total) + Number(invoice.previousRemaining || 0)
              : DUMMY_INVOICE_DATA.total,
        currency: invoice.currency ?? DUMMY_INVOICE_DATA.currency,
        notes: invoice.notes ?? DUMMY_INVOICE_DATA.notes,
      }
    : DUMMY_INVOICE_DATA;

  const placeholderValues = buildPlaceholderValues({
    scope: "invoice",
    invoice,
    organizationName: profileUser?.companyName,
    senderName: profileUser?.name,
    custom: customPlaceholders,
  });
  const resolvedNotes = replacePlaceholders(activeInvoice.notes, placeholderValues, {
    html: true,
  });

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
        return replacePlaceholders(item.description ?? "", placeholderValues);
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
                      color: staticTextColor,
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
                  color: primaryColor,
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
                  fontSize: `${data.labelFontSize || 10}pt`,
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
                      {data.invoiceDateLabel
                        ? `${data.invoiceDateLabel} :`
                        : ""}
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
                  fontSize: `${data.billToNameFontSize || 10}pt`,
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
                className={`${onSelectElement ? "cursor-pointer" : ""} ${
                  onSelectElement && selectedElement === "table-header"
                    ? "outline outline-2 outline-blue-500 outline-offset-1 ring-2 ring-blue-400/20"
                    : onSelectElement
                      ? "hover:outline hover:outline-1 hover:outline-blue-400/60 hover:outline-dashed"
                      : ""
                }`}
                title={
                  onSelectElement ? "Click to edit Table Header" : undefined
                }
              >
                <tr
                  style={{
                    backgroundColor: tableHeaderBgColor,
                  }}
                >
                  {enabledColumns.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        width: `${col.width}px`,
                        padding: "10px 12px",
                        textAlign: col.align,
                        verticalAlign: "middle",
                        color: tableHeaderTextColor,
                        fontSize: `${data.tableFontSize || 10}pt`,
                        fontWeight: "bold",
                        backgroundColor: tableHeaderBgColor,
                        boxSizing: "border-box",
                        lineHeight: 1.2,
                      }}
                    >
                      {col.label}
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
              className={`${onSelectElement ? "cursor-pointer" : ""} ${
                onSelectElement && selectedElement === "table-body"
                  ? "outline outline-2 outline-blue-500 outline-offset-1 ring-2 ring-blue-400/20"
                  : onSelectElement
                    ? "hover:outline hover:outline-1 hover:outline-blue-400/60 hover:outline-dashed"
                    : ""
              }`}
              title={onSelectElement ? "Click to edit Table Body" : undefined}
            >
              {activeInvoice.items.map((item: TemplatePreviewInvoiceItem, i: number) => (
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
                      style={{
                        width: `${col.width}px`,
                        padding: "6px 12px",
                        textAlign: col.align,
                        verticalAlign: "middle",
                        fontSize: `${data.tableFontSize || 10}pt`,
                        color: textColor,
                        boxSizing: "border-box",
                        lineHeight: 1.2,
                      }}
                    >
                      {getCellValue(item, col.key)}
                      {col.key === "itemName" &&
                        data.showItemDescription !== false &&
                        item.description && (
                          <div
                            style={{
                              fontSize: `${Math.max((Number(data.tableFontSize) || 10) - 1, 6)}pt`,
                              color: grayText,
                              marginTop: "2px",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {replacePlaceholders(item.description, placeholderValues)}
                          </div>
                        )}
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

            {data.showPreviousDue !== false && activeInvoice.previousRemaining > 0 && (
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

            {activeInvoice.writeOffAmount > 0 && (
              <SelectableElement
                id="write-off"
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
                    {data.writeOffLabel ?? "Write Off"}
                  </span>
                  <span
                    style={{
                      fontSize: `${data.labelFontSize || 10}pt`,
                      color: darkText,
                    }}
                  >
                    -{formatCurrency(activeInvoice.writeOffAmount)}
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
                      color: staticTextColor,
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
                  backgroundColor: accentColor,
                  padding: "8px 14px",
                  marginTop: "4px",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: `${data.labelFontSize || 11}pt`,
                    fontWeight: "bold",
                    color: balanceDueTextColor,
                    lineHeight: 1.2,
                  }}
                >
                  {data.balanceDueLabel ?? ""}
                </span>
                <span
                  style={{
                    fontSize: `${data.labelFontSize || 13}pt`,
                    fontWeight: "bold",
                    color: balanceDueTextColor,
                    lineHeight: 1.2,
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
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(resolvedNotes) }}
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
