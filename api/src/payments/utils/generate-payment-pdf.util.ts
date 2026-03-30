import PDFDocument = require('pdfkit');
import * as path from 'path';
import { Payment } from '../payment.entity';

export const generatePaymentPDF = async (payment: any): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const template = payment.template;

            // Extract template colors or use defaults
            const primaryColor = template?.primaryColor || '#FF9608';  // Orange
            const secondaryColor = template?.secondaryColor || '#075056'; // Teal
            const accentColor = template?.accentColor || '#FBBF24';    // Yellow
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

            // Font sizes
            const baseFontSize = template?.fontSize || 15;
            const headingFontSize = template?.headingFontSize || 20;
            const labelFontSize = template?.labelFontSize || 10;

            const doc = new PDFDocument({
                margin: 50,
                size: template?.paperSize || 'A4',
                layout: (template?.orientation as any) === 'Landscape' ? 'landscape' : 'portrait',
                bufferPages: true
            });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Helper function to format currency amounts
            const formatCurrency = (amount: number): string => {
                const currency = payment.currency || 'PKR';
                return `${currency} ${Number(amount).toFixed(2)}`;
            };

            // Header Section - Logo
            let logoDrawn = false;
            let logoBuffer: Buffer | undefined;

            // Try to fetch custom logo if available
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
                    // Handle local file path (e.g., /uploads/...)
                    try {
                        const relativePath = template.logoUrl.startsWith('/') ? template.logoUrl.slice(1) : template.logoUrl;
                        // Use process.cwd() to resolve from project root (where 'uploads' folder is)
                        const localPath = path.join(process.cwd(), relativePath);
                        const fs = require('fs');
                        if (fs.existsSync(localPath)) {
                            logoBuffer = fs.readFileSync(localPath);
                        } else {
                            console.error('Local logo file not found:', localPath);
                        }
                    } catch (e) {
                        console.error('Error reading local logo:', e);
                    }
                }
            }

            if (logoBuffer) {
                try {
                    doc.image(logoBuffer, 50, 40, {
                        fit: [180, 80],
                    });
                    logoDrawn = true;
                } catch (error) {
                    console.error('Error drawing logo to PDF:', error);
                }
            }

            const brandName = template?.brandName || 'revolutic';
            const tagline = template?.tagline || 'digital innovation leadership';

            if (!logoDrawn) {
                doc.fontSize(24).font('Helvetica-Bold').fillColor(textColor).text(brandName, 50, 50, { lineBreak: false });
                doc.fontSize(9).font('Helvetica').fillColor(grayText).text(tagline, 50, 78, { lineBreak: false });
            }

            // PAYMENT RECEIPT title and number (right aligned)
            const titleLabel = 'PAYMENT';
            doc.fontSize(headingFontSize).font('Helvetica-Bold').fillColor(redColor || primaryColor).text(titleLabel, 400, 48, { width: 150, align: 'right', lineBreak: false });
            doc.fontSize(baseFontSize + 5).font('Helvetica').fillColor(template?.invoiceNumberColor || secondaryColor).text(`#${payment.paymentNumber || 'DRAFT'}`, 400, 72 + (headingFontSize - 10), { width: 150, align: 'right', lineBreak: false });
            // Received From Section (left side)
            const detailsY = 140;
            doc.fontSize(baseFontSize + 3).font('Helvetica-Bold').fillColor(template?.billToColor || textColor).text(template?.billToLabel || 'Received From', 50, detailsY, { lineBreak: false });
            const customerName = payment.customerDisplayName || payment.customer?.displayName || payment.customer?.companyName || 'Customer';
            doc.fontSize(baseFontSize + 1).font('Helvetica').fillColor(textColor).text(customerName, 50, detailsY + 20, { lineBreak: false });

            const customerAddress = payment.customer?.address || '';
            if (customerAddress) {
                doc.fontSize(baseFontSize).font('Helvetica').fillColor(grayText).text(customerAddress, 50, detailsY + 40, { width: 250, lineBreak: false });
            }

            // Payment Details (right side)
            const labelX = 320;
            const valueX = 440;
            const valueWidth = 110;
            const rowHeight = 25;
            let currentY = detailsY;

            // Payment Date
            doc.fontSize(baseFontSize).font('Helvetica').fillColor(grayText).text('Payment Date :', labelX, currentY, { lineBreak: false });
            doc.fontSize(baseFontSize).font('Helvetica-Bold').fillColor(textColor).text(
                new Date(payment.paymentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                valueX, currentY, { width: valueWidth, align: 'right', lineBreak: false }
            );
            currentY += rowHeight;

            // Payment Mode
            doc.fontSize(baseFontSize).font('Helvetica').fillColor(grayText).text('Payment Mode :', labelX, currentY, { lineBreak: false });
            doc.fontSize(baseFontSize).font('Helvetica-Bold').fillColor(textColor).text(
                payment.paymentMode || 'N/A',
                valueX, currentY, { width: valueWidth, align: 'right', lineBreak: false }
            );
            currentY += rowHeight;

            // Reference
            if (payment.referenceNo) {
                doc.fontSize(baseFontSize).font('Helvetica').fillColor(grayText).text('Reference# :', labelX, currentY, { lineBreak: false });
                doc.fontSize(baseFontSize).font('Helvetica-Bold').fillColor(textColor).text(
                    payment.referenceNo,
                    valueX, currentY, { width: valueWidth, align: 'right', lineBreak: false }
                );
                currentY += rowHeight;
            }

            // Applied Invoices Table
            const tableTop = 230;
            const tableHeight = 30;

            // Table header with background
            doc.rect(50, tableTop, 495, tableHeight).fillAndStroke(tableHeaderBg, tableHeaderBg);

            // Header text
            doc.fontSize(baseFontSize).font('Helvetica-Bold').fillColor(tableHeaderText);
            doc.text('Invoice Number', 58, tableTop + 10, { width: 150, lineBreak: false });
            doc.text('Invoice Amount', 250, tableTop + 10, { width: 100, align: 'right', lineBreak: false });
            doc.text('Payment Amount', 400, tableTop + 10, { width: 140, align: 'right', lineBreak: false });

            // Rows
            let yPosition = tableTop + tableHeight;
            const itemsToShow = payment.appliedInvoices && payment.appliedInvoices.length > 0
                ? payment.appliedInvoices
                : [];

            if (itemsToShow.length > 0) {
                itemsToShow.forEach((item: any, index: number) => {
                    const rowHeight = 24;

                    // Alternating row background
                    if (template?.alternateRowColors !== false && index % 2 === 1) {
                        doc.rect(50, yPosition, 495, rowHeight).fill(tableRowColor);
                    } else {
                        doc.rect(50, yPosition, 495, rowHeight).fill(tableAltRowColor);
                    }

                    // Row border
                    if (template?.showTableBorders !== false) {
                        doc.rect(50, yPosition, 495, rowHeight).stroke(grayBorder);
                    }

                    // Row content
                    doc.fontSize(baseFontSize).font('Helvetica').fillColor(textColor);

                    // Handle populated invoice or direct string
                    const invNum = item.invoice ? item.invoice.invoiceNumber : '—';
                    doc.text(invNum, 58, yPosition + 7, { width: 150, lineBreak: false });

                    // Handle populated invoice total or direct amount
                    const invTotal = item.invoice ? item.invoice.total : 0;
                    doc.text(formatCurrency(invTotal), 250, yPosition + 7, { width: 100, align: 'right', lineBreak: false });

                    doc.text(formatCurrency(item.amount || 0), 400, yPosition + 7, { width: 140, align: 'right', lineBreak: false });

                    yPosition += rowHeight;
                });
            } else {
                // No specific invoices (On Account)
                doc.rect(50, yPosition, 495, 30).fill(tableAltRowColor);
                if (template?.showTableBorders !== false) doc.rect(50, yPosition, 495, 30).stroke(grayBorder);

                doc.fontSize(baseFontSize).font('Helvetica-Oblique').fillColor(grayText);
                doc.text('Payment received on account (no specific invoices applied)', 58, yPosition + 10, { width: 480, align: 'center' });
                yPosition += 30;
            }

            // Table bottom border
            if (template?.showTableBorders !== false) {
                doc.rect(50, tableTop, 495, yPosition - tableTop).stroke(grayBorder);
            }

            // Totals Section
            yPosition += 15;
            const totalsLabelX = 350;
            const totalsValueX = 465;

            // Amount Received
            doc.fontSize(baseFontSize + 1).font('Helvetica').fillColor(textColor).text('Amount Received', totalsLabelX, yPosition, { lineBreak: false });
            doc.fontSize(baseFontSize + 1).font('Helvetica').fillColor(textColor).text(
                formatCurrency(payment.amountReceived || 0),
                totalsValueX, yPosition, { width: 75, align: 'right', lineBreak: false }
            );
            yPosition += 25;

            // Bank Charges
            if (payment.bankCharges > 0) {
                doc.fontSize(baseFontSize).font('Helvetica').fillColor(textColor).text('Bank Charges', totalsLabelX, yPosition, { lineBreak: false });
                doc.fontSize(baseFontSize).font('Helvetica').fillColor(redColor).text(
                    `- ${formatCurrency(payment.bankCharges)}`,
                    totalsValueX, yPosition, { width: 75, align: 'right', lineBreak: false }
                );
                yPosition += 25;
            }

            // Separator
            doc.moveTo(350, yPosition - 5).lineTo(545, yPosition - 5).lineWidth(1).stroke(grayBorder);

            // Total Received Box
            const totalReceived = payment.amountReceived || 0;

            // Box
            doc.rect(350, yPosition, 195, 35).fillAndStroke(accentColor, accentColor);
            doc.fontSize(labelFontSize).font('Helvetica-Bold').fillColor(whiteColor).text(template?.totalLabel || 'TOTAL RECEIVED', 360, yPosition + 12, { lineBreak: false });
            doc.fontSize(labelFontSize + 4).font('Helvetica-Bold').fillColor(whiteColor).text(
                formatCurrency(totalReceived),
                465, yPosition + 9, { width: 75, align: 'right', lineBreak: false }
            );

            yPosition += 50;

            // Notes section
            if (payment.notes && template?.showNotes !== false) {
                doc.fontSize(baseFontSize + 2).font('Helvetica-Bold').fillColor(textColor).text(template?.notesLabel || 'Notes', 50, yPosition, { lineBreak: false });
                yPosition += 18;
                const notesText = payment.notes.replace(/<[^>]+>/g, '');

                doc.fontSize(9).font('Helvetica').fillColor(grayText).text(
                    notesText,
                    60,
                    yPosition + 5,
                    { width: 475, lineGap: 2 }
                );
            }

            // Footer
            if (template?.showFooter !== false) {
                const footerHeight = 35;
                const footerY = doc.page.height - footerHeight;

                doc.rect(0, footerY, doc.page.width, footerHeight).fill(template?.footerBackgroundColor || lightGrayBg);
                doc.moveTo(0, footerY).lineTo(doc.page.width, footerY).stroke(grayBorder);

                doc.fontSize(9).font('Helvetica').fillColor(grayText);
                const footerText = template?.footerText || 'Thank you for your business!';
                const textWidth = doc.widthOfString(footerText);
                const startX = (doc.page.width - textWidth) / 2;

                doc.text(footerText, startX, footerY + 12, { lineBreak: false });
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
