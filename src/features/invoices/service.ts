import { pdfOwnerPassword } from "@/environment";
import { BillableService, Invoice, InvoiceIssuer, InvoicePatient, InvoiceCreate } from "./model";
import { InvoicesRepository } from "./repository";
import { encryptPdf } from "./encryptPdf";
import mailInvoice, { MailSender } from "./mail";

export class InvoicesService {
  constructor(private readonly invoicesRepository: InvoicesRepository) {}

  async find(id: number): Promise<Invoice> {
    return this.invoicesRepository.find(id);
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice> {
    return this.invoicesRepository.findByInvoiceNumber(invoiceNumber);
  }

  async filter(
    params: Parameters<InvoicesRepository["filter"]>[0],
  ): Promise<{ rows: Invoice[]; total: number }> {
    return this.invoicesRepository.filter(params);
  }

  async findPatients(): Promise<InvoicePatient[]> {
    return this.invoicesRepository.findPatients();
  }

  async findBillableServices(): Promise<BillableService[]> {
    return this.invoicesRepository.findBillableServices();
  }

  async findIssuer(): Promise<InvoiceIssuer | null> {
    return this.invoicesRepository.findIssuer();
  }

  async generateInvoiceNumber(): Promise<string> {
    return this.invoicesRepository.generateInvoiceNumber();
  }

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

  async sendByEmail(invoiceId: number, sender: MailSender): Promise<Invoice> {
    const invoice = await this.invoicesRepository.find(invoiceId);
    const issuer = await this.invoicesRepository.findIssuer();
    if (!issuer) throw new Error("Cannot send an invoice before the therapeut is set up");

    const base64Pdf = await encryptPdf(
      invoice.base64Pdf,
      invoice.patient.invoicePassword || "",
      pdfOwnerPassword(),
    );

    await mailInvoice(issuer, { ...invoice, base64Pdf }, sender);

    return this.invoicesRepository.update({ ...invoice, status: "sent" });
  }

  async delete(invoiceId: number): Promise<void> {
    await this.invoicesRepository.delete(invoiceId);
  }
}
