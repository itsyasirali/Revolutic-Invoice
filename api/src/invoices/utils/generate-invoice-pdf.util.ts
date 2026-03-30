import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { Template } from '../../templates/template.entity';
import { Invoice } from '../invoice.entity';
import { Customer } from '../../customers/customer.entity';

interface ExtendedInvoice extends Omit<Invoice, 'customer' | 'template' | 'items' | 'previousRemaining'> {
  customer?: Customer & { receivables?: number; firstName?: string; companyName?: string };
  template?: Template;
  items?: any[];
  currentReceivables?: number;
  customerDisplayName?: string;
  customerAddress?: string;
  previousRemaining?: number;
}

export const generateInvoicePDF = (invoice: ExtendedInvoice): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const template = invoice.template;

      const primaryColor = template?.primaryColor || '#FF9608';
      const secondaryColor = template?.secondaryColor || '#075056';
      const accentColor = template?.accentColor || '#FBBF24';
      const textColor = template?.textColor || '#1f2937';
      const grayText = '#6b7280';
      const whiteColor = '#FFFFFF';
      const redColor = template?.invoiceNumberColor || '#EE5858';
      const lightGrayBg = template?.footerBackgroundColor || '#f9fafb';
      const grayBorder = template?.borderColor || '#e5e7eb';
      const tableHeaderBg = template?.tableHeaderBgColor || primaryColor;
      const tableHeaderText = template?.tableHeaderTextColor || whiteColor;
      const tableRowColor = template?.tableRowColor || '#fffbeb';
      const tableAltRowColor = template?.tableAltRowColor || '#ffffff';

      const baseFontSize = template?.fontSize || 10;
      const headingFontSize = template?.headingFontSize || 20;
      const labelFontSize = template?.labelFontSize || 10;

      const doc = new PDFDocument({
        margin: 35,
        size: template?.paperSize || 'A4',
        layout: (template?.orientation === 'Landscape') ? 'landscape' : 'portrait',
        bufferPages: true
      });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const formatCurrency = (amount: number | string | undefined): string => {
        const currency = invoice.currency || 'PKR';
        const numAmount = Number(amount) || 0;
        return `${numAmount.toFixed(2)} ${currency}`;
      };

      const customer = invoice.customer || {} as any;

      const previousRemaining = Number(invoice.previousRemaining) || 0;
      const subTotal = Number(invoice.subTotal) || 0;
      const total = Number(invoice.total) || 0;

      const totalBalanceDue = total + previousRemaining;

      let logoDrawn = false;
      let logoBuffer: Buffer | undefined;

      const fetchLogo = async () => {
        if (template?.logoUrl) {
          if (template.logoUrl.startsWith('http')) {
            try {
              const response = await fetch(template.logoUrl);
              if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                logoBuffer = Buffer.from(arrayBuffer);
              }
            } catch (error) {
              console.error('Failed to fetch remote logo:', error);
            }
          } else {
            try {
              const relativePath = template.logoUrl.startsWith('/') ? template.logoUrl.slice(1) : template.logoUrl;
              const localPath = path.join(process.cwd(), relativePath);
              if (fs.existsSync(localPath)) {
                logoBuffer = fs.readFileSync(localPath);
              }
            } catch (e) {
              console.error('Error reading local logo:', e);
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
            console.error('Error drawing logo to PDF:', error);
          }
        }

        const brandName = template?.brandName || 'revolutic';
        const tagline = template?.tagline || 'digital innovation leadership';

        if (!logoDrawn) {
          doc.fontSize(24).font('Helvetica-Bold').fillColor(textColor).text(brandName, 35, 35, { lineBreak: false });
          doc.fontSize(9).font('Helvetica').fillColor(grayText).text(tagline, 35, 60, { lineBreak: false });
        }

        const invoiceLabel = template?.invoiceLabel || 'INVOICE';
        doc.fontSize(headingFontSize).font('Helvetica-Bold').fillColor(redColor).text(invoiceLabel, 400, 35, { width: 155, align: 'right', lineBreak: false });
        doc.fontSize(baseFontSize).font('Helvetica').fillColor(template?.invoiceNumberColor || secondaryColor).text(`${invoice.invoiceNumber}`, 400, 60 + (headingFontSize - 20), { width: 155, align: 'right', lineBreak: false });

        const detailsY = 110;
        doc.fontSize(baseFontSize + 3).font('Helvetica-Bold').fillColor(template?.billToColor || textColor).text(template?.billToLabel || 'Bill To', 35, detailsY, { lineBreak: false });

        const customerName = invoice.customerDisplayName || customer.displayName || customer.companyName || customer.firstName || 'Customer';
        doc.fontSize(baseFontSize + 1).font('Helvetica').fillColor(textColor).text(customerName, 35, detailsY + 18, { lineBreak: false });

        const customerAddress = invoice.customerAddress || customer.address || '';
        if (customerAddress) {
          doc.fontSize(baseFontSize).font('Helvetica').fillColor(grayText).text(customerAddress, 35, detailsY + 36, { width: 250, lineBreak: false });
        }

        const labelX = 330;
        const valueX = 450;
        const valueWidth = 105;
        const rowHeight = 20;
        let currentY = detailsY;

        if (template?.showInvoiceDate !== false) {
          doc.fontSize(baseFontSize).font('Helvetica').fillColor(grayText).text((template?.invoiceDateLabel || 'Invoice Date') + ' :', labelX, currentY, { lineBreak: false });
          doc.fontSize(baseFontSize).font('Helvetica-Bold').fillColor(textColor).text(
            new Date(invoice.invoiceDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            valueX, currentY, { width: valueWidth, align: 'right', lineBreak: false }
          );
          currentY += rowHeight;
        }

        let termsText = 'Due on Receipt';
        if (invoice.dueDate && invoice.invoiceDate) {
          const daysDiff = Math.floor((new Date(invoice.dueDate).getTime() - new Date(invoice.invoiceDate).getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === 15) termsText = 'Net 15';
          else if (daysDiff === 30) termsText = 'Net 30';
          else if (daysDiff === 60) termsText = 'Net 60';
        }

        doc.fontSize(baseFontSize).font('Helvetica').fillColor(grayText).text((template?.termsLabel || 'Terms') + ' :', labelX, currentY, { lineBreak: false });
        doc.fontSize(baseFontSize).font('Helvetica-Bold').fillColor(textColor).text(termsText, valueX, currentY, { width: valueWidth, align: 'right', lineBreak: false });
        currentY += rowHeight;

        if (template?.showDueDate !== false) {
          doc.fontSize(baseFontSize).font('Helvetica').fillColor(grayText).text((template?.dueDateLabel || 'Due Date') + ' :', labelX, currentY, { lineBreak: false });
          doc.fontSize(baseFontSize).font('Helvetica-Bold').fillColor(textColor).text(
            invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
            valueX, currentY, { width: valueWidth, align: 'right', lineBreak: false }
          );
        }

        const tableTop = 180;
        const tableHeight = 25;

        const defaultColumns = [
          { key: 'index', label: '#', width: 25, align: 'left' },
          { key: 'items', label: template?.itemsLabel || 'Item & Description', width: 200, align: 'left' },
          { key: 'quantity', label: template?.quantityLabel || 'Qty', width: 55, align: 'center' },
          { key: 'rate', label: template?.rateLabel || 'Rate', width: 70, align: 'right' },
          { key: 'amount', label: template?.amountLabel || 'Amount', width: 75, align: 'right' }
        ];

        let columns = template?.tableColumnSettings;

        if (typeof columns === 'string') {
          try { columns = JSON.parse(columns); } catch (e) {
            // Invalid JSON, will fallback to default columns
          }
        }

        let activeColumns: any[] = [];
        if (Array.isArray(columns) && columns.length > 0) {
          activeColumns = columns
            .filter((c: any) => c.visible !== false && c.enabled !== false)
            .map((c: any) => ({
              key: c.columnName || c.key,
              label: c.label,
              width: Number(c.width),
              align: c.alignment || c.align
            }));
        } else {
          activeColumns = defaultColumns;
        }

        const availableWidth = 525;
        const totalRequestedWidth = activeColumns.reduce((sum: number, col: any) => sum + (Number(col.width) || 50), 0);

        let scaleFactor = 1;
        if (totalRequestedWidth > 0) {
          scaleFactor = availableWidth / totalRequestedWidth;
        }

        doc.rect(35, tableTop, availableWidth, tableHeight).fillAndStroke(tableHeaderBg, tableHeaderBg);

        let currentX = 35;

        doc.fontSize(baseFontSize).font('Helvetica-Bold').fillColor(tableHeaderText);

        const finalColumns = activeColumns.map((col: any) => {
          const w = (Number(col.width) || 50) * scaleFactor;
          const x = currentX;

          doc.text(col.label || '', x + 5, tableTop + 8, { width: w - 10, align: (col.align as any) || 'left', lineBreak: false });

          currentX += w;
          return { ...col, x, w };
        });

        let yPosition = tableTop + tableHeight;
        const itemsToShow = invoice.items || [];

        itemsToShow.forEach((item: any, index: number) => {
          const itemRowHeight = 22;

          if (template?.alternateRowColors !== false && index % 2 === 1) {
            doc.rect(35, yPosition, availableWidth, itemRowHeight).fill(tableRowColor);
          } else {
            doc.rect(35, yPosition, availableWidth, itemRowHeight).fill(tableAltRowColor);
          }

          doc.rect(35, yPosition, availableWidth, itemRowHeight).stroke(grayBorder);

          doc.fontSize(baseFontSize).font('Helvetica').fillColor(textColor);

          finalColumns.forEach((col: any) => {
            let value = '';

            switch (col.key) {
              case 'index':
                value = String(index + 1);
                break;
              case 'items':
              case 'item':
              case 'name':
              case 'itemName':
              case 'product':
                value = item.title || item.item?.name || item.name || '';
                break;
              case 'description':
                value = item.description || '';
                break;
              case 'quantity':
              case 'qty':
                value = (Number(item.quantity) || 0).toFixed(2);
                break;
              case 'rate':
              case 'price':
              case 'unitPrice':
                value = (Number(item.rate) || 0).toFixed(2);
                break;
              case 'amount':
              case 'total':
                value = (Number(item.amount) || 0).toFixed(2);
                break;
              case 'unit':
                value = item.unit || '';
                break;
              case 'discount':
                value = (item.discount || 0) + '%';
                break;
              case 'tax':
                value = (item.tax || 0) + '%';
                break;
              default:
                value = '';
            }

            doc.text(value, col.x + 5, yPosition + 6, { width: col.w - 10, align: (col.align as any) || 'left', ellipsis: true, lineBreak: false });
          });

          yPosition += itemRowHeight;
        });

        doc.rect(35, tableTop, availableWidth, yPosition - tableTop).stroke(grayBorder);

        yPosition += 12;
        const totalsLabelX = 360;
        const totalsValueX = 485;

        if (template?.showSubtotal !== false) {
          doc.fontSize(baseFontSize + 1).font('Helvetica').fillColor(textColor).text(template?.subtotalLabel || 'Sub Total', totalsLabelX, yPosition, { lineBreak: false });
          doc.fontSize(baseFontSize + 1).font('Helvetica').fillColor(textColor).text(
            formatCurrency(subTotal),
            totalsValueX, yPosition, { width: 75, align: 'right', lineBreak: false }
          );
          yPosition += 20;
        }

        doc.moveTo(360, yPosition - 3).lineTo(560, yPosition - 3).lineWidth(1).stroke(grayBorder);

        if (template?.showPreviousDue !== false) {
          doc.fontSize(baseFontSize).font('Helvetica').fillColor(grayText).text(template?.previousDueLabel || 'Previous Remaining', totalsLabelX, yPosition + 3, { lineBreak: false });

          const prevDueColor = template?.previousDueColor || secondaryColor;
          doc.fontSize(baseFontSize).font('Helvetica').fillColor(prevDueColor).text(
            formatCurrency(previousRemaining),
            totalsValueX, yPosition + 3, { width: 75, align: 'right', lineBreak: false }
          );
          yPosition += 25;
        }

        doc.fontSize(labelFontSize + 1).font('Helvetica-Bold').fillColor(textColor).text(template?.totalLabel || 'Total', totalsLabelX, yPosition, { lineBreak: false });
        doc.fontSize(labelFontSize + 1).font('Helvetica-Bold').fillColor(redColor).text(
          formatCurrency(invoice.total || totalBalanceDue),
          totalsValueX, yPosition, { width: 75, align: 'right', lineBreak: false }
        );
        yPosition += 22;

        doc.rect(360, yPosition, 200, 30).fillAndStroke(accentColor, accentColor);
        doc.fontSize(labelFontSize).font('Helvetica-Bold').fillColor(whiteColor).text(template?.balanceDueLabel || 'Balance Due', 370, yPosition + 9, { lineBreak: false });
        doc.fontSize(labelFontSize + 2).font('Helvetica-Bold').fillColor(whiteColor).text(
          formatCurrency(totalBalanceDue),
          480, yPosition + 8, { width: 75, align: 'right', lineBreak: false }
        );

        yPosition += 40;

        if (invoice.notes && template?.showNotes !== false) {
          doc.fontSize(baseFontSize + 2).font('Helvetica-Bold').fillColor(textColor).text(template?.notesLabel || 'Notes', 35, yPosition, { lineBreak: false });
          yPosition += 15;

          const parseHtml = (html: string) => {
            const text = html
              .replace(/<p[^>]*>/g, '')
              .replace(/<\/p>/g, '\n\n')
              .replace(/<br\s*\/?>/g, '\n')
              .replace(/<li[^>]*>/g, '• ').replace(/<\/li>/g, '\n')
              .replace(/<ul[^>]*>/g, '').replace(/<\/ul>/g, '\n')
              .replace(/<ol[^>]*>/g, '').replace(/<\/ol>/g, '\n')
              .replace(/<[^>]+>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"');
            return text.trim();
          };

          const parsedText = parseHtml(invoice.notes);
          const notesHeight = Math.max(80, doc.heightOfString(parsedText, { width: 490 }));

          doc.fontSize(9).font('Helvetica').fillColor('#374151').text(
            parsedText,
            35,
            yPosition + 5,
            { width: 490, lineGap: 1 }
          );
          yPosition += notesHeight + 20;
        }

        if (template?.showFooter !== false) {
          const footerHeight = 35;
          const footerY = doc.page.height - footerHeight;

          doc.rect(0, footerY, doc.page.width, footerHeight).fill(template?.footerBackgroundColor || lightGrayBg);
          doc.moveTo(0, footerY).lineTo(doc.page.width, footerY).stroke(grayBorder);

          doc.fontSize(9).font('Helvetica').fillColor(grayText);
          const footerText = template?.footerText || 'Powered by Revolutic — Smart Invoicing';
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