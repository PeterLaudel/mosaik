import { Invoice, InvoiceIssuer } from "./model";
import * as nodemailer from "nodemailer";

/** The signed-in account the invoice is sent from. */
export type MailSender =
  | { transport: "gmail"; email: string; accessToken: () => Promise<string> }
  // Keeps the mail in memory instead of sending it, for e2e tests
  | { transport: "json"; email: string };

const isTestEmail = () => process.env.NODE_ENV === "test";

// With the json transport (e2e) mails stay in memory; e2e reads the last one via testing.ts
let lastJsonMail: Record<string, unknown> | null = null;

/** Returns the last mail the json transport produced and forgets it. */
export function takeLastJsonMail(): Record<string, unknown> | null {
  const mail = lastJsonMail;
  lastJsonMail = null;
  return mail;
}

export default async function mailInvoice(
  therapeut: InvoiceIssuer,
  invoice: Invoice,
  sender: MailSender,
): Promise<void> {
  const transporter = await createTransport(sender);
  const info = await transporter.sendMail({
    from: `${therapeut.name} ${therapeut.surname} <${therapeut.email}>`,
    to: `${invoice.patient.name} ${invoice.patient.surname} <${invoice.patient.billingInfo.email}>`,
    subject: `Ihre Rechnung ${invoice.invoiceNumber}`,
    text: `Sehr geehrte/r ${invoice.patient.name} ${invoice.patient.surname},\n\nanbei erhalten Sie Ihre Rechnung ${invoice.invoiceNumber}.\n\nMit freundlichen Grüßen\n${therapeut.name} ${therapeut.surname}`,
    attachments: [
      {
        filename: `Rechnung_${invoice.invoiceNumber}.pdf`,
        content: Buffer.from(invoice.base64Pdf, "base64"),
        contentType: "application/pdf",
      },
    ],
  });

  if (transporter.transporter.name === "JSONTransport") {
    const { message } = info as unknown as { message: string };
    lastJsonMail = JSON.parse(message) as Record<string, unknown>;
  }
}

async function createTransport(sender: MailSender) {
  if (isTestEmail()) {
    const account = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  }

  if (sender.transport === "json") {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  const accessToken = await sender.accessToken();
  return nodemailer.createTransport({
    service: "gmail",
    auth: { type: "OAuth2", user: sender.email, accessToken },
  });
}
