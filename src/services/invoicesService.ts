import { pdfOwnerPassword } from "@/environment";
import { Invoice } from "@/models/invoice";
import { InvoiceSave, InvoicesRepository } from "@/repositories/invoicesRepository";
import { TherapeutRepository } from "@/repositories/therapeutRepository";
import { encryptPdf } from "./encryptPdf";
import mailInvoice from "./mailInvoice";

export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly therapeutRepository: TherapeutRepository,
  ) {}

  async save(invoice: InvoiceSave): Promise<Invoice> {
    return this.invoicesRepository.save(invoice);
  }

  async updateStatus(invoiceId: number, status: Invoice["status"]): Promise<Invoice> {
    const invoice = await this.invoicesRepository.find(invoiceId);
    return this.invoicesRepository.save({ ...invoice, status });
  }

  async sendByEmail(invoiceId: number): Promise<Invoice> {
    const invoice = await this.invoicesRepository.find(invoiceId);
    const [therapeut] = await this.therapeutRepository.all();

    const base64Pdf = await encryptPdf(
      invoice.base64Pdf,
      invoice.patient.invoicePassword || "",
      pdfOwnerPassword(),
    );

    await mailInvoice(therapeut, { ...invoice, base64Pdf });

    return this.invoicesRepository.save({ ...invoice, status: "sent" });
  }

  async delete(invoiceId: number): Promise<void> {
    await this.invoicesRepository.delete(invoiceId);
  }
}
