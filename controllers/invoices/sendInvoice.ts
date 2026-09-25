import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { Template } from "@/entities/Template";
import { Organization } from "@/entities/Organization";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { generateInvoicePDF } from "@/utils/invoices/generateInvoicePdf";
import {
  createMailTransporter,
  getMailFromName,
  getMailFromAddress,
  MissingMailConfigError,
} from "@/lib/mailer";
import { createInvoiceRecord, InvoiceOperationError } from "./createInvoice";
import { User } from "@/entities/User";
import { loadCustomPlaceholders } from "@/lib/placeholders/server";
import { buildPlaceholderValues } from "@/lib/placeholders/context";
import { replacePlaceholders } from "@/lib/placeholders/replace";
import type { CreateInvoicePayload, SendInvoicePayload } from "@/types/invoice";

const sendInvoice = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const orgId = await getAuthOrgId(req);
  if (!orgId) {
    return NextResponse.json(
      { message: "Active organization is required" },
      { status: 400 },
    );
  }
  const { id } = await params;

  try {
    const parsedUserId = userId;
    let invoiceId = Number(id);

    const body: SendInvoicePayload = await req.json();
    const { to, cc, bcc, message, subject, attachPDF, invoiceData } = body;

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
      const newInvoice = await createInvoiceRecord(
        parsedUserId,
        invoiceData as CreateInvoicePayload,
        orgId,
      );
      invoiceId = Number(newInvoice.id);
    }

    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);
    const templateRepository = db.getRepository(Template);
    const organizationRepository = db.getRepository(Organization);

    // Get invoice with populated relations
    const invoice = await invoiceRepository.findOne({
      where: { id: invoiceId, organizationId: orgId },
      relations: ["customer", "template", "items", "items.item", "organization", "writeOffs"],
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found or access denied" },
        { status: 404 },
      );
    }

    // Fallback: If invoice has no template, use client-provided template or org default template
    if (!invoice.template) {
      const clientTemplate = (invoiceData as any)?.template;
      if (clientTemplate) {
        invoice.template = clientTemplate as unknown as Template;
      } else {
        let defaultTemplate = await templateRepository.findOne({
          where: { organizationId: orgId, isDefault: true },
        });
        if (!defaultTemplate) {
          defaultTemplate = await templateRepository.findOne({
            where: { organizationId: orgId },
          });
        }
        if (defaultTemplate) {
          invoice.template = defaultTemplate;
        }
      }
    }

    // Fallback: If organization relation was not populated, fetch organization directly
    if (!invoice.organization && orgId) {
      const org = await organizationRepository.findOne({
        where: { id: orgId },
      });
      if (org) {
        invoice.organization = org;
      }
    }

    // Placeholder values (built-ins + org custom) used for email and PDF notes
    const sender = await db.getRepository(User).findOne({ where: { id: parsedUserId } });
    const placeholderValues = buildPlaceholderValues({
      scope: "invoice",
      invoice,
      organization: invoice.organization,
      organizationName: getMailFromName(invoice.organization?.name),
      sender,
      custom: await loadCustomPlaceholders(orgId),
    });

    // Generate PDF if required
    let pdfBuffer: Buffer | undefined;
    if (attachPDF !== false) {
      pdfBuffer = await generateInvoicePDF(
        invoice as unknown as Parameters<typeof generateInvoicePDF>[0],
        placeholderValues,
      );
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
    const companyName = getMailFromName(invoice.organization?.name);
    // Prefer the organization's own contact email for replies so recipients
    // reply directly to the business rather than a generic mailbox; fall
    // back to the configured MAIL_FROM_ADDRESS.
    const replyToAddress = invoice.organization?.email || getMailFromAddress();
    const emailSubject = subject
      ? replacePlaceholders(subject, placeholderValues)
      : `Invoice - ${invoiceNumber} from ${companyName}`;

    // Use custom message or default
    const customMessage =
      message || "Thank you for your business. Please find your invoice attached.";
    const formattedMessage = replacePlaceholders(customMessage, placeholderValues, {
      html: true,
    }).replace(/\n/g, "<br/>");

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

    // Plain-text alternative to the HTML body. Emails with only an HTML
    // part (no text/plain alternative) are a common spam filter signal, so
    // always include one derived from the customer-facing message.
    const emailText = `Invoice #${invoiceNumber}\n\n${customMessage}\n\nPowered by Revolutic`;

    // Send email
    const mailOptions = {
      from: `"${companyName}" <${getMailFromAddress()}>`,
      replyTo: replyToAddress,
      to: to.join(", "),
      ...(cc && cc.length > 0 && { cc: cc.join(", ") }),
      ...(bcc && bcc.length > 0 && { bcc: bcc.join(", ") }),
      subject: emailSubject,
      text: emailText,
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
      relations: ["customer", "template", "items", "writeOffs"],
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
