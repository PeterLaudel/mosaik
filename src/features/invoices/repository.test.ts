import { sql } from "kysely";
import timekeeper from "timekeeper";
import { patientFactory } from "factories/patients";
import { getDb } from "@/initialize";
import { InvoicesRepository } from "./repository";
import { invoiceFactory } from "factories/invoices";
import { patientInvoiceFactory } from "factories/patientInvoices";
import { serviceFactory } from "factories/services";
import { invoicePositionFactory } from "factories/invoicePositions";
import { databaseDialect } from "@/environment";
import { therapeutFactory } from "factories/therapeuts";
import { serviceAmountFactory } from "factories/serviceAmounts";
import { BillableService, InvoicePatient } from "./model";

type PatientRow = Awaited<ReturnType<typeof patientFactory.create>>;
type ServiceRow = Awaited<ReturnType<typeof serviceFactory.create>>;

// The invoices feature's view of a patients row.
function toInvoicePatient(row: PatientRow): InvoicePatient {
  const billingAddress = { street: row.billingStreet, city: row.billingCity, zip: row.billingZip };
  const billingInfo = {
    name: row.billingName,
    surname: row.billingSurname,
    email: row.billingEmail,
    address: billingAddress,
  };
  return {
    id: row.id,
    name: row.name,
    surname: row.surname,
    birthdate: row.birthdate,
    diagnosis: row.diagnosis,
    billingInfo,
    invoicePassword: row.invoicePassword,
  };
}

// The invoices feature's view of a services row and its price rows.
function toBillableService(row: ServiceRow, amounts: BillableService["amounts"]): BillableService {
  return {
    id: row.id,
    short: row.short,
    originalGopNr: row.originalGopNr,
    description: row.description,
    amounts,
  };
}

describe("InvoicesRepository", () => {
  let invoicesRepository: InvoicesRepository;

  beforeEach(() => {
    const db = getDb();
    invoicesRepository = new InvoicesRepository(db);
  });

  describe("#create", () => {
    it("creates a new invoice", async () => {
      const patientRow = await patientFactory.create();
      const patient = toInvoicePatient(patientRow);
      const serviceRow = await serviceFactory.create();
      const service = toBillableService(serviceRow, []);

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
        patient,
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
      const patientRow = await patientFactory.create();
      const patient = toInvoicePatient(patientRow);
      const invoice = await invoiceFactory.create();
      const serviceRow = await serviceFactory.create();
      const service = toBillableService(serviceRow, []);
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
        patient,
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

  describe("#findPatients", () => {
    it("returns every patient as an invoice recipient", async () => {
      const patient = await patientFactory.create();

      const patients = await invoicesRepository.findPatients();

      expect(patients).toEqual([toInvoicePatient(patient)]);
    });
  });

  describe("#findBillableServices", () => {
    it("returns catalog services with their prices", async () => {
      const serviceRow = await serviceFactory.create();
      const amount = await serviceAmountFactory.create({ serviceId: serviceRow.id, factor: "2.3", price: 42 });

      const services = await invoicesRepository.findBillableServices();

      const amounts = [{ factor: amount.factor, price: amount.price }];
      expect(services).toEqual([toBillableService(serviceRow, amounts)]);
    });
  });

  describe("#findIssuer", () => {
    it("returns null when no therapeut exists", async () => {
      expect(await invoicesRepository.findIssuer()).toBeNull();
    });

    it("returns the therapeut issuing the invoice", async () => {
      const therapeut = await therapeutFactory.create();

      const issuer = await invoicesRepository.findIssuer();

      expect(issuer).toMatchObject({ id: therapeut.id, name: therapeut.name, iban: therapeut.iban });
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
