import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { Template } from "@/entities/Template";
import { Invoice } from "@/entities/Invoice";
import { Customer } from "@/entities/Customer";

export interface InvoiceItemPdf {
  title?: string;
  name?: string;
  description?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
  unit?: string;
  discount?: number;
  tax?: number;
  item?: { name?: string };
}

export interface ColumnConfig {
  key?: string;
  label?: string;
  width?: number | string;
  align?: "left" | "center" | "right" | "justify";
  visible?: boolean;
  enabled?: boolean;
  columnName?: string;
  alignment?: "left" | "center" | "right" | "justify";
  x?: number;
  w?: number;
}

export interface ExtendedCustomer extends Partial<Customer> {
  receivables?: number;
  firstName?: string;
  companyName?: string;
}

interface ExtendedInvoice extends Omit<
  Invoice,
  "customer" | "template" | "items" | "previousRemaining"
> {
  customer?: ExtendedCustomer;
  template?: Template;
  items?: InvoiceItemPdf[];
  currentReceivables?: number;
  customerDisplayName?: string;
  customerAddress?: string;
  previousRemaining?: number;
}

export const generateInvoicePDF = (
  invoice: ExtendedInvoice,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const template = invoice.template;

      const isValidHex = (color: unknown): color is string => {
        if (!color || typeof color !== "string") return false;
        if (color === "#") return false;
        return /^#([0-9A-F]{3}){1,2}$/i.test(color);
      };

      const getColor = (val: string | undefined, defaultVal: string): string => {
        return isValidHex(val) ? val : defaultVal;
      };

      const primaryColor = getColor(template?.primaryColor, "#1AA3FF");
      const accentColor = getColor(template?.accentColor, "#1AA3FF");
      const invoiceNumberColor = getColor(template?.invoiceNumberColor, "#1AA3FF");
      const tableHeaderBgColor = getColor(template?.tableHeaderBgColor, "#1AA3FF");
      const tableHeaderTextColor = getColor(template?.tableHeaderTextColor, "#ffffff");
      const balanceDueTextColor = getColor(template?.balanceDueTextColor, "#ffffff");

      // All other text and label colors are strictly static #1F2937:
      const staticTextColor = "#1F2937";
      const billToColor = staticTextColor;
      const billToNameColor = staticTextColor;
      const billToAddressColor = staticTextColor;
      const previousDueColor = staticTextColor;
      const textColor = staticTextColor;
      const headerTextColor = staticTextColor;
      const invoiceDateLabelColor = staticTextColor;
      const invoiceDateValueColor = staticTextColor;
      const dueDateLabelColor = staticTextColor;
      const dueDateValueColor = staticTextColor;
      const termsLabelColor = staticTextColor;
      const termsValueColor = staticTextColor;
      const grayText = staticTextColor;

      const tableRowColor = "#ffffff";
      const tableAltRowColor = "#ffffff";
      const tableBorderColor = "#e5e7eb";
      const borderColor = "#e5e7eb";
      const footerBackgroundColor = "#f9fafb";

      const baseFontSize = template?.fontSize || 10;
      const headingFontSize = template?.headingFontSize || 20;
      const labelFontSize = template?.labelFontSize || 10;
      const tableFontSize = template?.tableFontSize || baseFontSize || 9;

      const doc = new PDFDocument({
        margin: 35,
        size: template?.paperSize || "A4",
        layout:
          template?.orientation === "Landscape" ? "landscape" : "portrait",
        bufferPages: true,
      });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      const formatCurrency = (amount: number | string | undefined): string => {
        const currency = invoice.currency ?? "";
        const numAmount = Number(amount) || 0;
        return currency
          ? `${numAmount.toFixed(2)} ${currency}`
          : `${numAmount.toFixed(2)}`;
      };

      const customer = (invoice.customer || {}) as ExtendedCustomer;

      const previousRemaining = Number(invoice.previousRemaining) || 0;
      const subTotal = Number(invoice.subTotal) || 0;
      const total = Number(invoice.total) || 0;

      const totalBalanceDue = total + previousRemaining;

      let logoDrawn = false;
      let logoBuffer: Buffer | undefined;

      const fetchLogo = async () => {
        if (template?.logoUrl) {
          if (template.logoUrl.startsWith("http")) {
            try {
              const response = await fetch(template.logoUrl);
              if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                logoBuffer = Buffer.from(arrayBuffer);
              }
            } catch (error) {
              console.error("Failed to fetch remote logo:", error);
            }
          } else {
            try {
              const relativePath = template.logoUrl.startsWith("/")
                ? template.logoUrl.slice(1)
                : template.logoUrl;
              const localPath = path.join(
                /*turbopackIgnore: true*/ process.cwd(),
                relativePath,
              );
              if (fs.existsSync(localPath)) {
                logoBuffer = fs.readFileSync(localPath);
              }
            } catch (e) {
              console.error("Error reading local logo:", e);
            }
          }
        }

        if (logoBuffer) {
          try {
            doc.image(logoBuffer, 35, 30, {
              fit: [150, 60],
            });
            logoDrawn = true;
          } catch (error) {
            console.error("Error drawing logo to PDF:", error);
          }
        }

        const brandName = template?.brandName ?? "";
        const tagline = template?.tagline ?? "";

        if (!logoDrawn) {
          if (brandName) {
            doc
              .fontSize(24)
              .font("Helvetica-Bold")
              .fillColor(headerTextColor)
              .text(brandName, 35, 35, { lineBreak: false });
          }
          if (tagline) {
            doc
              .fontSize(9)
              .font("Helvetica")
              .fillColor(textColor)
              .text(tagline, 35, 60, { lineBreak: false });
          }
        }

        const invoiceLabel = template?.invoiceLabel ?? "";
        if (invoiceLabel) {
          doc
            .fontSize(headingFontSize)
            .font("Helvetica-Bold")
            .fillColor(primaryColor)
            .text(invoiceLabel, 400, 35, {
              width: 155,
              align: "right",
              lineBreak: false,
            });
        }
        if (invoice.invoiceNumber) {
          doc
            .fontSize(baseFontSize)
            .font("Helvetica")
            .fillColor(invoiceNumberColor)
            .text(`${invoice.invoiceNumber}`, 400, 60 + (headingFontSize - 20), {
              width: 155,
              align: "right",
              lineBreak: false,
            });
        }

        const detailsY = 110;
        const billToLabel = template?.billToLabel ?? "";
        if (billToLabel) {
          doc
            .fontSize(template?.labelFontSize || 10)
            .font("Helvetica-Bold")
            .fillColor(billToColor)
            .text(billToLabel, 35, detailsY, {
              lineBreak: false,
            });
        }

        const customerName =
          invoice.customerDisplayName ||
          customer.displayName ||
          customer.companyName ||
          customer.firstName ||
          "";
        if (customerName) {
          doc
            .fontSize(template?.billToNameFontSize || 10)
            .font("Helvetica")
            .fillColor(billToNameColor)
            .text(customerName, 35, detailsY + 18, { lineBreak: false });
        }

        const customerAddress =
          invoice.customerAddress || customer.address || "";
        if (customerAddress) {
          doc
            .fontSize(baseFontSize)
            .font("Helvetica")
            .fillColor(billToAddressColor)
            .text(customerAddress, 35, detailsY + 36, {
              width: 250,
              lineBreak: false,
            });
        }

        const labelX = 330;
        const valueX = 450;
        const valueWidth = 105;
        const rowHeight = 20;
        let currentY = detailsY;

        if (template?.showInvoiceDate !== false) {
          const invoiceDateLabel = template?.invoiceDateLabel ?? "";
          if (invoiceDateLabel) {
            doc
              .fontSize(baseFontSize)
              .font("Helvetica")
              .fillColor(invoiceDateLabelColor)
              .text(
                `${invoiceDateLabel} :`,
                labelX,
                currentY,
                {
                  lineBreak: false,
                },
              );
          }
          if (invoice.invoiceDate) {
            doc
              .fontSize(baseFontSize)
              .font("Helvetica-Bold")
              .fillColor(invoiceDateValueColor)
              .text(
                new Date(invoice.invoiceDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
                valueX,
                currentY,
                { width: valueWidth, align: "right", lineBreak: false },
              );
          }
          currentY += rowHeight;
        }

        let termsText = (invoice as any).terms || "";
        if (!termsText && invoice.dueDate && invoice.invoiceDate) {
          const daysDiff = Math.floor(
            (new Date(invoice.dueDate).getTime() -
              new Date(invoice.invoiceDate).getTime()) /
              (1000 * 60 * 60 * 24),
          );
          if (daysDiff === 15) termsText = "Net 15";
          else if (daysDiff === 30) termsText = "Net 30";
          else if (daysDiff === 60) termsText = "Net 60";
        }

        const termsLabel = template?.termsLabel ?? "";
        if (termsLabel || termsText) {
          if (termsLabel) {
            doc
              .fontSize(baseFontSize)
              .font("Helvetica")
              .fillColor(termsLabelColor)
              .text(`${termsLabel} :`, labelX, currentY, {
                lineBreak: false,
              });
          }
          if (termsText) {
            doc
              .fontSize(baseFontSize)
              .font("Helvetica-Bold")
              .fillColor(termsValueColor)
              .text(termsText, valueX, currentY, {
                width: valueWidth,
                align: "right",
                lineBreak: false,
              });
          }
          currentY += rowHeight;
        }

        if (template?.showDueDate !== false) {
          const dueDateLabel = template?.dueDateLabel ?? "";
          if (dueDateLabel) {
            doc
              .fontSize(baseFontSize)
              .font("Helvetica")
              .fillColor(dueDateLabelColor)
              .text(
                `${dueDateLabel} :`,
                labelX,
                currentY,
                {
                  lineBreak: false,
                },
              );
          }
          if (invoice.dueDate) {
            doc
              .fontSize(baseFontSize)
              .font("Helvetica-Bold")
              .fillColor(dueDateValueColor)
              .text(
                new Date(invoice.dueDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
                valueX,
                currentY,
                { width: valueWidth, align: "right", lineBreak: false },
              );
          }
        }

        const tableTop = Math.max(180, currentY + 25);
        const tableHeight = 25;
        const showTableHeader =
          template?.showTableHeader !== false &&
          String(template?.showTableHeader) !== "false";

        const defaultColumns = [
          { key: "index", label: "#", width: 25, align: "left" },
          {
            key: "items",
            label: template?.itemsLabel ?? "",
            width: 200,
            align: "left",
          },
          {
            key: "quantity",
            label: template?.quantityLabel ?? "",
            width: 55,
            align: "center",
          },
          {
            key: "rate",
            label: template?.rateLabel ?? "",
            width: 70,
            align: "right",
          },
          {
            key: "amount",
            label: template?.amountLabel ?? "",
            width: 75,
            align: "right",
          },
        ];

        const getDefaultColumnLabel = (key: string): string => {
          switch (key) {
            case "index":
              return "#";
            case "itemName":
            case "name":
            case "item":
            case "items":
            case "description":
              return template?.itemsLabel ?? "";
            case "quantity":
            case "qty":
              return template?.quantityLabel ?? "";
            case "rate":
            case "price":
            case "unitPrice":
              return template?.rateLabel ?? "";
            case "amount":
            case "total":
              return template?.amountLabel ?? "";
            default:
              return key ?? "";
          }
        };

        const parseColumnWidth = (w: unknown, key: string): number => {
          const defaultWidths: Record<string, number> = {
            index: 25,
            itemName: 200,
            items: 200,
            item: 200,
            description: 150,
            quantity: 55,
            qty: 55,
            rate: 70,
            price: 70,
            amount: 75,
            total: 75,
          };
          const fallback = defaultWidths[key] || 60;

          if (typeof w === "number" && !isNaN(w) && w > 0) {
            return w;
          }
          if (typeof w === "string") {
            if (w.endsWith("%")) {
              const pct = parseFloat(w);
              if (!isNaN(pct) && pct > 0) {
                return (pct / 100) * 525;
              }
            }
            const parsed = parseFloat(w);
            if (!isNaN(parsed) && parsed > 0) {
              return parsed;
            }
          }
          return fallback;
        };

        let columns = template?.tableColumnSettings;

        if (typeof columns === "string") {
          try {
            columns = JSON.parse(columns);
          } catch {
            // Invalid JSON, will fallback to default columns
          }
        }

        let activeColumns: {
          key: string;
          label: string;
          width: number;
          align: "left" | "center" | "right" | "justify";
        }[] = [];

        if (Array.isArray(columns) && columns.length > 0) {
          activeColumns = (columns as any[])
            .filter((c) => c.visible !== false && c.enabled !== false)
            .map((c) => {
              const key = String(c.columnName || c.key || "");
              const label =
                c.label && typeof c.label === "string" && c.label.trim()
                  ? c.label.trim()
                  : getDefaultColumnLabel(key);
              const width = parseColumnWidth(c.width, key);
              const align = (c.alignment || c.align || "left") as
                | "left"
                | "center"
                | "right"
                | "justify";

              return { key, label, width, align };
            });
        } else {
          activeColumns = defaultColumns as {
            key: string;
            label: string;
            width: number;
            align: "left" | "center" | "right" | "justify";
          }[];
        }

        const availableWidth = 525;
        const totalRequestedWidth = activeColumns.reduce(
          (sum: number, col) => sum + (Number(col.width) || 50),
          0,
        );

        let scaleFactor = 1;
        if (totalRequestedWidth > 0) {
          scaleFactor = availableWidth / totalRequestedWidth;
        }

        let currentX = 35;
        const finalColumns = activeColumns.map((col: ColumnConfig) => {
          const w = (Number(col.width) || 50) * scaleFactor;
          const x = currentX;
          currentX += w;
          return { ...col, x, w };
        });

        if (showTableHeader) {
          doc
            .rect(35, tableTop, availableWidth, tableHeight)
            .fillAndStroke(tableHeaderBgColor, tableHeaderBgColor);

          doc
            .fontSize(tableFontSize)
            .font("Helvetica-Bold")
            .fillColor(tableHeaderTextColor);

          finalColumns.forEach((col: ColumnConfig) => {
            doc.text(col.label || "", (col.x || 35) + 5, tableTop + 7, {
              width: (col.w || 50) - 10,
              align: col.align || "left",
              lineBreak: false,
            });
          });
        }

        let yPosition = showTableHeader ? tableTop + tableHeight : tableTop;
        const itemsToShow = invoice.items || [];

        itemsToShow.forEach((item: InvoiceItemPdf, index: number) => {
          const itemRowHeight = 22;

          if (template?.alternateRowColors !== false && index % 2 === 1) {
            doc
              .rect(35, yPosition, availableWidth, itemRowHeight)
              .fill(tableAltRowColor);
          } else {
            doc
              .rect(35, yPosition, availableWidth, itemRowHeight)
              .fill(tableRowColor);
          }

          doc
            .rect(35, yPosition, availableWidth, itemRowHeight)
            .stroke(tableBorderColor);

          doc.fontSize(baseFontSize).font("Helvetica").fillColor(textColor);

          finalColumns.forEach((col: ColumnConfig) => {
            let value = "";

            switch (col.key) {
              case "index":
                value = String(index + 1);
                break;
              case "items":
              case "item":
              case "name":
              case "itemName":
              case "product":
                value = item.title || item.item?.name || item.name || "";
                break;
              case "description":
                value = item.description || "";
                break;
              case "quantity":
              case "qty":
                value = (Number(item.quantity) || 0).toFixed(2);
                break;
              case "rate":
              case "price":
              case "unitPrice":
                value = (Number(item.rate) || 0).toFixed(2);
                break;
              case "amount":
              case "total":
                value = (Number(item.amount) || 0).toFixed(2);
                break;
              case "unit":
                value = item.unit || "";
                break;
              case "discount":
                value = (item.discount || 0) + "%";
                break;
              case "tax":
                value = (item.tax || 0) + "%";
                break;
              default:
                value = "";
            }

            doc.text(value, col.x ? col.x + 5 : 40, yPosition + 6, {
              width: col.w ? col.w - 10 : 40,
              align: col.align || "left",
              ellipsis: true,
              lineBreak: false,
            });
          });

          yPosition += itemRowHeight;
        });

        doc
          .rect(35, tableTop, availableWidth, yPosition - tableTop)
          .stroke(tableBorderColor);

        yPosition += 12;
        const totalsLabelX = 360;
        const totalsValueX = 485;

        if (template?.showSubtotal !== false) {
          doc
            .fontSize(baseFontSize)
            .font("Helvetica")
            .fillColor(grayText)
            .text(
              template?.subtotalLabel ?? "",
              totalsLabelX,
              yPosition,
              {
                lineBreak: false,
              },
            );
          doc
            .fontSize(baseFontSize + 1)
            .font("Helvetica")
            .fillColor(textColor)
            .text(formatCurrency(subTotal), totalsValueX, yPosition, {
              width: 75,
              align: "right",
              lineBreak: false,
            });
          yPosition += 20;
        }

        doc
          .moveTo(360, yPosition - 3)
          .lineTo(560, yPosition - 3)
          .lineWidth(1)
          .stroke(borderColor);

        if (template?.showPreviousDue !== false) {
          doc
            .fontSize(baseFontSize)
            .font("Helvetica")
            .fillColor(grayText)
            .text(
              template?.previousDueLabel ?? "",
              totalsLabelX,
              yPosition + 3,
              {
                lineBreak: false,
              },
            );

          doc
            .fontSize(baseFontSize)
            .font("Helvetica")
            .fillColor(previousDueColor)
            .text(
              formatCurrency(previousRemaining),
              totalsValueX,
              yPosition + 3,
              {
                width: 75,
                align: "right",
                lineBreak: false,
              },
            );
          yPosition += 25;
        }

        doc
          .fontSize(labelFontSize + 1)
          .font("Helvetica-Bold")
          .fillColor(textColor)
          .text(template?.totalLabel ?? "", totalsLabelX, yPosition, {
            lineBreak: false,
          });
        doc
          .fontSize(labelFontSize + 1)
          .font("Helvetica-Bold")
          .fillColor(textColor)
          .text(
            formatCurrency(invoice.total || totalBalanceDue),
            totalsValueX,
            yPosition,
            {
              width: 75,
              align: "right",
              lineBreak: false,
            },
          );
        yPosition += 22;

        doc
          .rect(360, yPosition, 200, 30)
          .fillAndStroke(accentColor, accentColor);
        doc
          .fontSize(labelFontSize)
          .font("Helvetica-Bold")
          .fillColor(balanceDueTextColor)
          .text(
            template?.balanceDueLabel ?? "",
            370,
            yPosition + 9,
            {
              lineBreak: false,
            },
          );
        doc
          .fontSize(labelFontSize + 2)
          .font("Helvetica-Bold")
          .fillColor(balanceDueTextColor)
          .text(formatCurrency(totalBalanceDue), 480, yPosition + 8, {
            width: 75,
            align: "right",
            lineBreak: false,
          });

        yPosition += 40;

        if (invoice.notes && template?.showNotes !== false) {
          doc
            .fontSize(baseFontSize + 2)
            .font("Helvetica-Bold")
            .fillColor(textColor)
            .text(template?.notesLabel ?? "", 35, yPosition, {
              lineBreak: false,
            });
          yPosition += 15;

          const parseHtml = (html: string) => {
            const text = html
              .replace(/<p[^>]*>/g, "")
              .replace(/<\/p>/g, "\n\n")
              .replace(/<br\s*\/?>/g, "\n")
              .replace(/<li[^>]*>/g, "• ")
              .replace(/<\/li>/g, "\n")
              .replace(/<ul[^>]*>/g, "")
              .replace(/<\/ul>/g, "\n")
              .replace(/<ol[^>]*>/g, "")
              .replace(/<\/ol>/g, "\n")
              .replace(/<[^>]+>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"');
            return text.trim();
          };

          const parsedText = parseHtml(invoice.notes);
          const notesHeight = Math.max(
            80,
            doc.heightOfString(parsedText, { width: 490 }),
          );

          doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor(textColor)
            .text(parsedText, 35, yPosition + 5, { width: 490, lineGap: 1 });
          yPosition += notesHeight + 20;
        }

        if (template?.showFooter !== false && template?.footerText) {
          const footerHeight = 35;
          const footerY = doc.page.height - footerHeight;

          doc
            .rect(0, footerY, doc.page.width, footerHeight)
            .fill(footerBackgroundColor);
          doc
            .moveTo(0, footerY)
            .lineTo(doc.page.width, footerY)
            .stroke(borderColor);

          doc.fontSize(9).font("Helvetica").fillColor(grayText);
          const footerText = template.footerText;
          const textWidth = doc.widthOfString(footerText);
          const startX = (doc.page.width - textWidth) / 2;

          doc.text(footerText, startX, footerY + 12, { lineBreak: false });
        }

        doc.end();
      };

      fetchLogo().catch((err) => {
        console.error("Error in PDF generation process:", err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
