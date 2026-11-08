import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { invoiceFactory } from "factories/invoices";
import { patientFactory } from "factories/patients";
import { patientInvoiceFactory } from "factories/patientInvoices";
import { createFeatureApp } from "@/shared/testing/featureApp";
import { InvoicesModule } from "./module";

// @libpdf/core pulls a chain of ESM-only crypto packages Jest cannot load; encryption is not under test here
jest.mock("./encryptPdf", () => ({ encryptPdf: jest.fn() }));

describe("InvoicesController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createFeatureApp(InvoicesModule);
  });

  afterAll(async () => {
    await app.close();
  });

  async function createInvoice() {
    const patient = await patientFactory.create();
    const invoice = await invoiceFactory.create({ status: "pending" });
    await patientInvoiceFactory.create({ patientId: patient.id, invoiceId: invoice.id });
    return invoice;
  }

  it("GET /invoices/patients is not captured by /invoices/:id", async () => {
    await patientFactory.create();

    const response = await request(app.getHttpServer()).get("/invoices/patients");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("PUT /invoices/:id/status updates the status", async () => {
    const invoice = await createInvoice();

    const response = await request(app.getHttpServer())
      .put(`/invoices/${invoice.id}/status`)
      .send({ status: "paid" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("paid");
  });

  it("GET /invoices/by-number/:invoiceNumber/pdf streams the stored PDF", async () => {
    const invoice = await createInvoice();

    const response = await request(app.getHttpServer()).get(
      `/invoices/by-number/${invoice.invoiceNumber}/pdf`,
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.body).toEqual(Buffer.from(invoice.base64Pdf, "base64"));
  });
});
