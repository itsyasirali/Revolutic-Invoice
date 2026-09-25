import nodemailer, { Transporter } from "nodemailer";

export class MissingMailConfigError extends Error {
  constructor() {
    super("Email configuration is missing. Please contact administrator.");
    this.name = "MissingMailConfigError";
  }
}

/** Mirrors the transporter setup duplicated in invoices-send.service.ts / payments-send.service.ts. */
export const createMailTransporter = (): Transporter => {
  const mailUsername = process.env.MAIL_USERNAME;
  const mailPassword = process.env.MAIL_PASSWORD;

  if (!mailUsername || !mailPassword) {
    throw new MissingMailConfigError();
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_PORT === "465",
    auth: {
      user: mailUsername,
      pass: mailPassword,
    },
  });
};

/**
 * The display name used for outgoing mail. Prefers an org-specific name
 * (passed in by callers that know the sending organization) over the
 * globally configured MAIL_FROM_NAME, falling back to the app name only
 * as a last resort. A generic/app-wide sender name on every email is a
 * common spam signal, so callers that have an organization name should
 * pass it through.
 */
export const getMailFromName = (organizationName?: string | null): string =>
  organizationName?.trim() || process.env.MAIL_FROM_NAME || "Revolutic";

export const getMailFromAddress = (): string =>
  process.env.MAIL_FROM_ADDRESS || (process.env.MAIL_USERNAME as string);
