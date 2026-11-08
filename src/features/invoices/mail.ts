import { Invoice, InvoiceIssuer } from "./model";
import * as nodemailer from "nodemailer";

/** The signed-in account the invoice is sent from. */
export type MailSender =
  | { transport: "gmail"; email: string; accessToken: () => Promise<string> }
  // Builds the mail without sending it (MAIL_TRANSPORT=json), e.g. locally without Gmail
  | { transport: "json"; email: string };

const isTestEmail = () => process.env.NODE_ENV === "test";

export default async function mailInvoice(
  therapeut: InvoiceIssuer,
  invoice: Invoice,
  sender: MailSender,
): Promise<void> {
  const transporter = await createTransport(sender);
  await transporter.sendMail({
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
