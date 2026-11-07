import { sql } from "kysely";
import timekeeper from "timekeeper";
import { patientFactory } from "../../factories/patient";
import { getDb } from "@/initialize";
import { InvoicesRepository } from "./invoicesRepository";
import { invoiceFactory } from "factories/invoice";
import { patientInvoiceFactory } from "factories/patientInvoice";
import { serviceFactory } from "factories/service";
import { invoicePositionFactory } from "factories/invoicePosition";
import { databaseDialect } from "@/environment";

describe("InvoicesRepository", () => {
  let invoicesRepository: InvoicesRepository;

  beforeEach(() => {
    const db = getDb();
    invoicesRepository = new InvoicesRepository(db);
  });

  describe("#create", () => {
    it("creates a new invoice", async () => {
      const patient = await patientFactory.create();
      const service = await serviceFactory.create();

      const createdInvoice = await invoicesRepository.create({
        patient,
        invoiceAmount: 200,
        invoiceNumber: "200212433",
        status: "pending",
        base64Pdf: "data:application/pdf;base64,example",
        positions: [
          {
            amount: 2,
            factor: "1.0",
            service,
            serviceDate: "2020-01-01",
            price: 100.1,
          },
        ],
      });

      expect(createdInvoice).toEqual({
        id: expect.any(Number),
        invoiceNumber: "200212433",
        base64Pdf: "data:application/pdf;base64,example",
        invoiceAmount: 200,
        status: "pending",
        patient: patient,
        positions: [
          {
            amount: 2,
            factor: "1.0",
            service: expect.any(Object),
            serviceDate: "2020-01-01",
            price: 100.1,
          },
        ],
      });
    });

  });

  describe("#update", () => {
    it("updates an existing invoice", async () => {
      const patient = await patientFactory.create();
      const invoice = await invoiceFactory.create();
      const service = await serviceFactory.create();
      await patientInvoiceFactory.create({
        patientId: patient.id,
        invoiceId: invoice.id,
      });

      await invoicePositionFactory.create({
        invoiceId: invoice.id,
        serviceId: service.id,
      });

      const updatedInvoice = await invoicesRepository.update({
        id: invoice.id,
        patient,
        base64Pdf: "data:application/pdf;base64,updated-example",
        invoiceAmount: 200,
        invoiceNumber: "202310032",
        status: "sent",
        positions: [
          {
            amount: 10,
            factor: "1.0",
            service,
            serviceDate: "2020-01-01",
            price: 100.1,
          },
        ],
      });

      expect(updatedInvoice).toEqual({
        id: invoice.id,
        invoiceNumber: "202310032",
        base64Pdf: "data:application/pdf;base64,updated-example",
        invoiceAmount: 200,
        status: "sent",
        patient: patient,
        positions: [
          {
            amount: 10,
            factor: "1.0",
            service: expect.any(Object),
            serviceDate: "2020-01-01",
            price: 100.1,
          },
        ],
      });
    });
  });

  describe("#generateInvoiceNumber", () => {
    beforeEach(() => {
      timekeeper.freeze(new Date("2023-10-04T00:00:00Z"));
    });

    afterEach(() => {
      timekeeper.reset();
    });

    const itif = (condition: boolean) => condition ? it : it.skip;

    itif(databaseDialect() === "sqlite")("generates a unique invoice number", async () => {
      const db = getDb();
      // For SQLite, reset the auto-increment value by updating sqlite_sequence table
      await sql`DELETE FROM invoices`.execute(db);
      await sql`DELETE FROM sqlite_sequence WHERE name = 'invoices'`.execute(
        db,
      );
      await invoiceFactory.createList(3, {});

      const invoiceNumber = await invoicesRepository.generateInvoiceNumber();

      expect(invoiceNumber).toEqual("202310044");
    });
  });
});
