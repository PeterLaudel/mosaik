import { Invoice, InvoiceIssuer } from "./model";
import * as nodemailer from "nodemailer";
import { googleClientId, googleClientSecret } from "@/environment";
import { RequestUser } from "@/shared/orpc/context";

/** The signed-in account the invoice is sent from. */
export type MailSender = Pick<RequestUser, "email" | "provider" | "refreshToken">;

const isTestEmail = () => process.env.NODE_ENV === "test";

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
    global.lastEmailPreviewUrl = JSON.stringify(info);
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

  if (sender.provider === "google") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: sender.email,
        clientId: googleClientId(),
        clientSecret: googleClientSecret(),
        refreshToken: sender.refreshToken,
      },
    });
  }

  return nodemailer.createTransport({ jsonTransport: true });
}
