import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { getToken } from "next-auth/jwt";
import { generateInvoicePDF } from "@/utils/invoices/generateInvoicePdf";
import {
  createMailTransporter,
  getMailFromName,
  getMailFromAddress,
  MissingMailConfigError,
} from "@/lib/mailer";
import { createInvoiceRecord, InvoiceOperationError } from "./createInvoice";
import type { SendInvoicePayload } from "@/types/invoice";

const sendInvoice = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const data = { user: token };
  const userId = data.user?.id;
  const { id } = await params;

  try {
    const parsedUserId = parseInt(String(userId));
    let invoiceId = Number(id);

    const body: SendInvoicePayload = await req.json();
    const { to, cc, bcc, message, attachPDF, invoiceData } = body;

    // Handle sending an unsaved 'draft' invoice — mirrors the NestJS
    // InvoicesController.send()'s inline
    // `if (id === 'draft' || isNaN(invoiceId))` branch: create the invoice
    // first (reusing the same creation logic as POST /invoices), then send.
    if (id === "draft" || isNaN(invoiceId)) {
      if (!invoiceData) {
        // Mirrors `throw new Error('Invoice data is required for sending draft')`
        // in the NestJS source, which Nest's default filter turns into a 500.
        return NextResponse.json(
          { message: "Invoice data is required for sending draft" },
          { status: 500 },
        );
      }
      const newInvoice = await createInvoiceRecord(parsedUserId, invoiceData);
      invoiceId = Number(newInvoice.id);
    }

    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);

    // Get invoice with populated relations
    const invoice = await invoiceRepository.findOne({
      where: { id: invoiceId, userId: parsedUserId },
      relations: ["customer", "template", "items", "items.item"],
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found or access denied" },
        { status: 404 },
      );
    }

    // Generate PDF if required
    let pdfBuffer: Buffer | undefined;
    if (attachPDF !== false) {
      pdfBuffer = await generateInvoicePDF(invoice as unknown as Parameters<typeof generateInvoicePDF>[0]);
    }

    // Configure email transporter (shared factory from lib/mailer.ts —
    // throws MissingMailConfigError if MAIL_USERNAME/MAIL_PASSWORD aren't
    // set, matching the original "Email configuration is missing" check).
    let transporter;
    try {
      transporter = createMailTransporter();
    } catch (err) {
      if (err instanceof MissingMailConfigError) {
        return NextResponse.json({ message: err.message }, { status: 400 });
      }
      throw err;
    }

    const invoiceNumber = invoice.invoiceNumber;
    const companyName = getMailFromName();
    const emailSubject = `Invoice - ${invoiceNumber} from ${companyName}`;

    // Use custom message or default
    const customMessage =
      message || "Thank you for your business. Please find your invoice attached.";
    const formattedMessage = customMessage.replace(/\n/g, "<br/>");

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
    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `Invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    // Send email
    const mailOptions = {
      from: `"${companyName}" <${getMailFromAddress()}>`,
      to: to.join(", "),
      ...(cc && cc.length > 0 && { cc: cc.join(", ") }),
      ...(bcc && bcc.length > 0 && { bcc: bcc.join(", ") }),
      subject: emailSubject,
      html: emailHtml,
      attachments,
    };

    await transporter.sendMail(mailOptions);

    // Update invoice status if not already sent/paid
    if (invoice.status !== "Sent" && invoice.status !== "Paid") {
      invoice.status = "Sent";
      invoice.recipients = to;
      await invoiceRepository.save(invoice);
    }

    // Return updated invoice
    const result = await invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ["customer", "template", "items"],
    });

    if (!result) {
      return NextResponse.json(
        { message: "Invoice not found after sending" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Invoice email sent successfully",
      invoice: result,
      emailSent: true,
    });
  } catch (error) {
    if (error instanceof InvoiceOperationError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { message: "Failed to send invoice" },
      { status: 500 },
    );
  }
};

export default sendInvoice;
