import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import { Organization } from "@/entities/Organization";
import { User } from "@/entities/User";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { generateInvoicePDF } from "@/utils/invoices/generateInvoicePdf";
import { quoteToInvoiceDocument } from "@/utils/quotes/quoteInvoiceAdapter";
import {
  createMailTransporter,
  getMailFromName,
  getMailFromAddress,
  MissingMailConfigError,
} from "@/lib/mailer";
import { loadCustomPlaceholders } from "@/lib/placeholders/server";
import { buildPlaceholderValues } from "@/lib/placeholders/context";
import { replacePlaceholders } from "@/lib/placeholders/replace";
import { expireQuotes, loadQuote } from "./quotePayload";

interface SendQuotePayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  message?: string;
  subject?: string;
  attachPDF?: boolean;
}

const SENDABLE = ["Draft", "Sent", "Viewed"];

const sendQuote = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;
  const { id } = await params;

  try {
    const body = (await req.json()) as SendQuotePayload;
    const { to, cc, bcc, message, subject, attachPDF } = body;
    if (!Array.isArray(to) || to.length === 0) {
      throw new HttpError("At least one recipient is required", 400);
    }

    const db = await getDatabase();
    await expireQuotes(db, orgId);
    const quote = await loadQuote(db, parseInt(id), orgId);
    if (!quote) throw new HttpError("Quote not found or access denied", 404);
    if (!SENDABLE.includes(quote.status)) {
      throw new HttpError(`A ${quote.status} quote cannot be sent`, 409);
    }

    if (!quote.template) {
      const templateRepo = db.getRepository(Template);
      const fallback =
        (await templateRepo.findOne({ where: { organizationId: orgId, isDefault: true } })) ||
        (await templateRepo.findOne({ where: { organizationId: orgId } }));
      if (fallback) quote.template = fallback;
    }
    const organization = await db
      .getRepository(Organization)
      .findOne({ where: { id: orgId } });
    const sender = await db.getRepository(User).findOne({ where: { id: userId } });

    const doc = quoteToInvoiceDocument(quote);
    const placeholderValues = buildPlaceholderValues({
      scope: "invoice",
      invoice: doc as never,
      organization,
      organizationName: getMailFromName(organization?.name),
      sender,
      custom: await loadCustomPlaceholders(orgId),
    });

    let pdfBuffer: Buffer | undefined;
    if (attachPDF !== false) {
      pdfBuffer = await generateInvoicePDF(
        { ...doc, organization } as unknown as Parameters<typeof generateInvoicePDF>[0],
        placeholderValues,
      );
    }

    let transporter;
    try {
      transporter = createMailTransporter();
    } catch (err) {
      if (err instanceof MissingMailConfigError) throw new HttpError(err.message, 400);
      throw err;
    }

    const companyName = getMailFromName(organization?.name);
    const replyTo = organization?.email || getMailFromAddress();
    const emailSubject = subject
      ? replacePlaceholders(subject, placeholderValues)
      : `Quote - ${quote.quoteNumber} from ${companyName}`;
    const customMessage =
      message || "Thank you for your interest. Please find your quote attached.";
    const formattedMessage = replacePlaceholders(customMessage, placeholderValues, {
      html: true,
    }).replace(/\n/g, "<br/>");

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Quote ${quote.quoteNumber}</title></head>
<body style="margin: 0; padding: 20px; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background-color: #2563eb; padding: 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Quote #${quote.quoteNumber}</h1>
    </div>
    <div style="padding: 40px;">
      <div style="font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${formattedMessage}</div>
    </div>
    <div style="padding: 20px; border-top: 1px solid #e5e7eb; text-align: center; background-color: #f9fafb;">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">Powered by <span style="color: #f97316; font-weight: 600;">Revolutic</span></p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"${companyName}" <${getMailFromAddress()}>`,
      replyTo,
      to: to.join(", "),
      ...(cc && cc.length > 0 && { cc: cc.join(", ") }),
      ...(bcc && bcc.length > 0 && { bcc: bcc.join(", ") }),
      subject: emailSubject,
      text: `Quote #${quote.quoteNumber}\n\n${customMessage}\n\nPowered by Revolutic`,
      html: emailHtml,
      attachments: pdfBuffer
        ? [
            {
              filename: `Quote-${quote.quoteNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : [],
    });

    // Draft -> Sent; Sent/Viewed keep their status when re-sent.
    if (quote.status === "Draft") {
      await db.query(
        `UPDATE "quotes" SET "status" = 'Sent', "updatedAt" = NOW()
         WHERE "id" = $1 AND "organizationId" = $2 AND "status" = 'Draft'`,
        [quote.id, orgId],
      );
    }

    return NextResponse.json({
      message: "Quote email sent successfully",
      quote: await loadQuote(db, quote.id, orgId),
      emailSent: true,
    });
  } catch (error) {
    return errorResponse(error, "Failed to send quote");
  }
};

export default sendQuote;
