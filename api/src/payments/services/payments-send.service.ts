import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payment.entity';
import { SendPaymentDto } from '../dto/send-payment.dto';
import * as nodemailer from 'nodemailer';
import { generatePaymentPDF } from '../utils/generate-payment-pdf.util';
import { ConfigService } from '@nestjs/config';
import { Template } from '../../templates/template.entity';

@Injectable()
export class PaymentsSendService {
    private readonly logger = new Logger(PaymentsSendService.name);

    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(Template)
        private templateRepository: Repository<Template>,
        private configService: ConfigService,
    ) { }

    async send(
        userId: number,
        paymentId: number,
        sendPaymentDto: SendPaymentDto,
    ): Promise<any> {
        const { to, cc, bcc, message, attachPDF } = sendPaymentDto;

        // Get payment with populated relations
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId, userId },
            relations: ['customer', 'template', 'appliedInvoices', 'appliedInvoices.invoice'],
        });

        if (!payment) {
            throw new NotFoundException('Payment not found or access denied');
        }

        // If no template is assigned, try to find default template
        if (!payment.template) {
            const defaultTemplate = await this.templateRepository.findOne({
                where: { userId, isDefault: true },
            });

            if (defaultTemplate) {
                payment.template = defaultTemplate;
            } else {
                // Fallback: try to find ANY template for the user
                const anyTemplate = await this.templateRepository.findOne({
                    where: { userId },
                    order: { createdAt: 'DESC' }
                });
                if (anyTemplate) {
                    payment.template = anyTemplate;
                }
            }
        }

        // Generate PDF if required
        let pdfBuffer: Buffer | undefined;
        if (attachPDF !== false) {
            try {
                pdfBuffer = await generatePaymentPDF(payment);
            } catch (error) {
                this.logger.error(`Error generating PDF for payment ${paymentId}`, error);
                throw new BadRequestException('Failed to generate payment PDF');
            }
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

        const paymentNumber = payment.paymentNumber || 'DRAFT';
        const companyName =
            this.configService.get<string>('MAIL_FROM_NAME') || 'Revolutic';
        const emailSubject = `Payment Receipt - #${paymentNumber} from ${companyName}`;

        // Use custom message or default
        // Use custom message or default
        const customMessage =
            message || `Please find attached your payment receipt for Payment #${paymentNumber}.`;
        const formattedMessage = customMessage.replace(/\n/g, '<br/>');

        // Email HTML template (Aligned with InvoicesSendService)
        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt ${paymentNumber}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background-color: #f97316; padding: 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Payment Receipt #${paymentNumber}</h1>
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
                filename: `Payment-Receipt-${paymentNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            });
        }

        // Send email
        const mailOptions = {
            from: `"${companyName}" <${this.configService.get<string>('MAIL_FROM_ADDRESS') || mailUsername}>`,
            to: (to || []).join(', '),
            ...(cc && cc.length > 0 && { cc: cc.join(', ') }),
            ...(bcc && bcc.length > 0 && { bcc: bcc.join(', ') }),
            subject: emailSubject,
            html: emailHtml,
            attachments,
        };

        await transporter.sendMail(mailOptions);

        // Update payment status if not already sent
        if (payment.status !== 'Sent') {
            payment.status = 'Sent';
            await this.paymentRepository.save(payment);
        }

        // Return updated payment (Aligned with InvoicesSendService return style)
        const result = await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: ['customer', 'template', 'appliedInvoices', 'appliedInvoices.invoice'],
        });

        if (!result) {
            throw new NotFoundException('Payment not found after sending');
        }

        return result;
    }
}
