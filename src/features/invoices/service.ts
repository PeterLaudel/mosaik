import { pdfOwnerPassword } from "@/environment";
import { Invoice } from "./model";
import {
  InvoiceCreate,
  InvoicesRepository,
} from "./repository";
import { encryptPdf } from "./encryptPdf";
import mailInvoice from "./mail";

export class InvoicesService {
  constructor(private readonly invoicesRepository: InvoicesRepository) {}

  async create(invoice: InvoiceCreate): Promise<Invoice> {
    return this.invoicesRepository.create(invoice);
  }

  async update(invoice: Invoice): Promise<Invoice> {
    return this.invoicesRepository.update(invoice);
  }

  async updateStatus(invoiceId: number, status: Invoice["status"]): Promise<Invoice> {
    const invoice = await this.invoicesRepository.find(invoiceId);
    return this.invoicesRepository.update({ ...invoice, status });
  }

  async sendByEmail(invoiceId: number): Promise<Invoice> {
    const invoice = await this.invoicesRepository.find(invoiceId);
    const issuer = await this.invoicesRepository.findIssuer();
    if (!issuer) throw new Error("Cannot send an invoice before the therapeut is set up");

    const base64Pdf = await encryptPdf(
      invoice.base64Pdf,
      invoice.patient.invoicePassword || "",
      pdfOwnerPassword(),
    );

    await mailInvoice(issuer, { ...invoice, base64Pdf });

    return this.invoicesRepository.update({ ...invoice, status: "sent" });
  }

  async delete(invoiceId: number): Promise<void> {
    await this.invoicesRepository.delete(invoiceId);
  }
}
