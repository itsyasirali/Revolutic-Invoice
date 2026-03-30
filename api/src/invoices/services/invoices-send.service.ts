import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoice.entity';
import { SendInvoiceDto } from '../dto/send-invoice.dto';
import * as nodemailer from 'nodemailer';
import { generateInvoicePDF } from '../utils/generate-invoice-pdf.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvoicesSendService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        private configService: ConfigService,
    ) { }

    async send(
        userId: number,
        invoiceId: number,
        sendInvoiceDto: SendInvoiceDto,
    ): Promise<Invoice> {
        const { to, cc, bcc, message, attachPDF } = sendInvoiceDto;

        // Get invoice with populated relations
        const invoice = await this.invoiceRepository.findOne({
            where: { id: invoiceId, userId },
            relations: ['customer', 'template', 'items', 'items.item'],
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found or access denied');
        }

        // Generate PDF if required
        let pdfBuffer: Buffer | undefined;
        if (attachPDF !== false) {
            pdfBuffer = await generateInvoicePDF(invoice);
        }

        // Check email configuration
        const mailUsername = this.configService.get<string>('MAIL_USERNAME');
        const mailPassword = this.configService.get<string>('MAIL_PASSWORD');

        if (!mailUsername || !mailPassword) {
            throw new BadRequestException(
                'Email configuration is missing. Please contact administrator.',
            );
        }

        // Configure email transporter
        const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
            port: Number(this.configService.get<string>('MAIL_PORT') || 587),
            secure: this.configService.get<string>('MAIL_PORT') === '465',
            auth: {
                user: mailUsername,
                pass: mailPassword,
            },
        });

        const invoiceNumber = invoice.invoiceNumber;
        const companyName =
            this.configService.get<string>('MAIL_FROM_NAME') || 'Revolutic';
        const emailSubject = `Invoice - ${invoiceNumber} from ${companyName}`;

        // Use custom message or default
        const customMessage =
            message || 'Thank you for your business. Please find your invoice attached.';
        const formattedMessage = customMessage.replace(/\n/g, '<br/>');

        // Email HTML template
        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background-color: #2563eb; padding: 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Invoice #${invoiceNumber}</h1>
    </div>
    <div style="padding: 40px;">
      <div style="font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap;">
        ${formattedMessage}
      </div>
    </div>
    <div style="padding: 20px; border-top: 1px solid #e5e7eb; text-align: center; background-color: #f9fafb;">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        Powered by <span style="color: #f97316; font-weight: 600;">Revolutic</span>
      </p>
    </div>
  </div>
</body>
</html>
    `;

        // Prepare attachments
        const attachments: any[] = [];
        if (pdfBuffer) {
            attachments.push({
                filename: `Invoice-${invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            });
        }

        // Send email
        const mailOptions = {
            from: `"${companyName}" <${this.configService.get<string>('MAIL_FROM_ADDRESS') || mailUsername}>`,
            to: to.join(', '),
            ...(cc && cc.length > 0 && { cc: cc.join(', ') }),
            ...(bcc && bcc.length > 0 && { bcc: bcc.join(', ') }),
            subject: emailSubject,
            html: emailHtml,
            attachments,
        };

        await transporter.sendMail(mailOptions);

        // Update invoice status if not already sent/paid
        if (invoice.status !== 'Sent' && invoice.status !== 'Paid') {
            invoice.status = 'Sent';
            invoice.recipients = to;
            await this.invoiceRepository.save(invoice);
        }

        // Return updated invoice
        const result = await this.invoiceRepository.findOne({
            where: { id: invoiceId },
            relations: ['customer', 'template', 'items'],
        });

        if (!result) {
            throw new NotFoundException('Invoice not found after sending');
        }

        return result;
    }
}
