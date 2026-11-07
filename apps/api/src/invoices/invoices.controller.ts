import { Controller } from "@nestjs/common";
import { contract } from "@mosaik/contract";
import { Implement, implement, ORPCError } from "@orpc/nest";
import { pdfOwnerPassword } from "../environment";
import { orNotFound } from "../notFound";
import { InvoicesRepository } from "../repositories/invoicesRepository";
import { TherapeutRepository } from "../repositories/therapeutRepository";
import { encryptPdf } from "./encryptPdf";
import mailInvoice from "./mailInvoice";

@Controller()
export class InvoicesController {
  constructor(
    private readonly invoices: InvoicesRepository,
    private readonly therapeuts: TherapeutRepository,
  ) {}

  @Implement(contract.invoices.sendEmail)
  sendEmail() {
    return implement(contract.invoices.sendEmail).handler(async ({ input, context }) => {
      const invoice = await orNotFound(this.invoices.find(input.id), `Invoice ${input.id} not found`);
      const [therapeut] = await this.therapeuts.all();
      if (!therapeut) throw new ORPCError("PRECONDITION_FAILED", { message: "No therapist profile saved" });

      const base64Pdf = await encryptPdf(invoice.base64Pdf, invoice.patient.invoicePassword || "", pdfOwnerPassword());
      await mailInvoice(context.request.session, therapeut, { ...invoice, base64Pdf });

      await this.invoices.save({ ...invoice, status: "sent" });
      return { status: "sent" as const };
    });
  }
}
