import { Controller, Inject } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { ORPCError, implement } from "@orpc/server";
import { mailTransport } from "@/environment";
import { RequestAuth } from "@/shared/orpc/context";
import { invoicesContract } from "./contract";
import { MailSender } from "./mail";
import { generateInvoiceBlob } from "./pdf";
import { InvoicesService } from "./service";

const procedures = implement(invoicesContract);

function mailSender(auth: RequestAuth): MailSender {
  const { email } = auth.user;
  if (mailTransport() === "json") return { transport: "json", email };
  return { transport: "gmail", email, accessToken: () => auth.googleAccessToken() };
}

function pdfFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: "application/pdf" });
}

@Controller()
export class InvoicesController {
  constructor(@Inject(InvoicesService) private readonly invoicesService: InvoicesService) {}

  @Implement(invoicesContract)
  invoices() {
    return {
      filter: procedures.filter.handler(({ input }) => this.invoicesService.filter(input)),
      find: procedures.find.handler(({ input }) => this.invoicesService.find(input.id)),
      downloadPdf: procedures.downloadPdf.handler(async ({ input }) => {
        const invoice = await this.invoicesService.findByInvoiceNumber(input.invoiceNumber);
        const pdf = Buffer.from(invoice.base64Pdf, "base64");
        const blob = new Blob([pdf], { type: "application/pdf" });
        return pdfFile(blob, `${input.invoiceNumber}.pdf`);
      }),
      findPatients: procedures.findPatients.handler(() => this.invoicesService.findPatients()),
      findBillableServices: procedures.findBillableServices.handler(() =>
        this.invoicesService.findBillableServices(),
      ),
      findIssuer: procedures.findIssuer.handler(() => this.invoicesService.findIssuer()),
      generateInvoiceNumber: procedures.generateInvoiceNumber.handler(() =>
        this.invoicesService.generateInvoiceNumber(),
      ),
      generatePdf: procedures.generatePdf.handler(async ({ input }) => {
        const blob = await generateInvoiceBlob(input);
        return pdfFile(blob, `${input.invoiceNumber}.pdf`);
      }),
      create: procedures.create.handler(({ input }) => this.invoicesService.create(input)),
      update: procedures.update.handler(({ input }) => this.invoicesService.update(input)),
      updateStatus: procedures.updateStatus.handler(({ input }) =>
        this.invoicesService.updateStatus(input.id, input.status),
      ),
      sendByEmail: procedures.sendByEmail.handler(({ input, context }) => {
        // Mail goes out through the signed-in user's Gmail account, even where auth is optional
        if (!context.auth) throw new ORPCError("UNAUTHORIZED");
        const sender = mailSender(context.auth);
        return this.invoicesService.sendByEmail(input.id, sender);
      }),
      delete: procedures.delete.handler(({ input }) => this.invoicesService.delete(input.id)),
    };
  }
}
