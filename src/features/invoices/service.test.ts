import { getDb } from "@/initialize";
import { InvoicesRepository } from "./repository";
import { invoiceFactory } from "factories/invoices";
import { patientFactory } from "factories/patients";
import { patientInvoiceFactory } from "factories/patientInvoices";
import { therapeutFactory } from "factories/therapeuts";
import { encryptPdf } from "./encryptPdf";
import { InvoicesService } from "./service";
import mailInvoice from "./mail";

jest.mock("./mail", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("./encryptPdf", () => ({ encryptPdf: jest.fn() }));

const mockedMailInvoice = mailInvoice as jest.MockedFunction<typeof mailInvoice>;
const mockedEncryptPdf = encryptPdf as jest.MockedFunction<typeof encryptPdf>;

describe("InvoicesService", () => {
  let invoicesService: InvoicesService;

  beforeEach(() => {
    const db = getDb();
    const invoicesRepository = new InvoicesRepository(db);
    invoicesService = new InvoicesService(invoicesRepository);
    mockedMailInvoice.mockReset();
    mockedEncryptPdf.mockReset();
  });

  async function createInvoice(status: "pending" | "sent" | "paid" = "pending") {
    const patient = await patientFactory.create();
    const invoice = await invoiceFactory.create({ status });
    await patientInvoiceFactory.create({ patientId: patient.id, invoiceId: invoice.id });
    return { patient, invoice };
  }

  describe("#updateStatus", () => {
    it("persists the new status", async () => {
      const { invoice } = await createInvoice("pending");

      const updated = await invoicesService.updateStatus(invoice.id, "paid");

      expect(updated.status).toBe("paid");
    });
  });

  describe("#sendByEmail", () => {
    it("mails the encrypted PDF from the therapeut and marks the invoice as sent", async () => {
      const therapeut = await therapeutFactory.create();
      const { invoice, patient } = await createInvoice("pending");
      mockedEncryptPdf.mockResolvedValue("encrypted-pdf");

      const sent = await invoicesService.sendByEmail(invoice.id);

      expect(mockedEncryptPdf).toHaveBeenCalledWith(
        invoice.base64Pdf,
        patient.invoicePassword || "",
        expect.any(String),
      );
      expect(mockedMailInvoice).toHaveBeenCalledWith(
        expect.objectContaining({ id: therapeut.id }),
        expect.objectContaining({ id: invoice.id, base64Pdf: "encrypted-pdf" }),
      );
      expect(sent.status).toBe("sent");
      // The stored PDF stays unencrypted; only the mailed copy is protected.
      expect(sent.base64Pdf).toBe(invoice.base64Pdf);
    });

    it("leaves the status unchanged when mailing fails", async () => {
      await therapeutFactory.create();
      const { invoice } = await createInvoice("pending");
      mockedEncryptPdf.mockResolvedValue("encrypted-pdf");
      mockedMailInvoice.mockRejectedValue(new Error("SMTP down"));

      await expect(invoicesService.sendByEmail(invoice.id)).rejects.toThrow("SMTP down");

      const row = await getDb()
        .selectFrom("invoices")
        .select("status")
        .where("id", "=", invoice.id)
        .executeTakeFirstOrThrow();
      expect(row.status).toBe("pending");
    });
  });
});
