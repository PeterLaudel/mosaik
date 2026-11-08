import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { getDb } from "@/initialize";
import { invoiceFactory } from "factories/invoices";
import { patientFactory } from "factories/patients";
import { patientInvoiceFactory } from "factories/patientInvoices";
import { therapeutFactory } from "factories/therapeuts";
import { createFeatureApp, linkGoogleAccount, signIn, testUser } from "@/shared/testing/featureApp";
import mailInvoice from "./mail";
import { InvoicesModule } from "./module";

// @libpdf/core pulls a chain of ESM-only crypto packages Jest cannot load; encryption is not under test here
jest.mock("./encryptPdf", () => ({ encryptPdf: jest.fn() }));
jest.mock("./mail", () => ({ __esModule: true, default: jest.fn() }));

const mockedMailInvoice = mailInvoice as jest.MockedFunction<typeof mailInvoice>;

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

    const response = await request(app.getHttpServer()).get("/api/invoices/patients");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("PUT /invoices/:id/status updates the status", async () => {
    const invoice = await createInvoice();

    const response = await request(app.getHttpServer())
      .put(`/api/invoices/${invoice.id}/status`)
      .send({ status: "paid" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("paid");
  });

  it("GET /invoices/by-number/:invoiceNumber/pdf streams the stored PDF", async () => {
    const invoice = await createInvoice();

    const response = await request(app.getHttpServer()).get(
      `/api/invoices/by-number/${invoice.invoiceNumber}/pdf`,
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.body).toEqual(Buffer.from(invoice.base64Pdf, "base64"));
  });

  describe("POST /invoices/:id/send", () => {
    beforeEach(() => {
      mockedMailInvoice.mockReset();
    });

    it("sends from the signed-in Google account and marks the invoice as sent", async () => {
      await therapeutFactory.create();
      const invoice = await createInvoice();
      const { userId, cookie } = await signIn();
      await linkGoogleAccount(userId, "google-access-token");

      const response = await request(app.getHttpServer())
        .post(`/api/invoices/${invoice.id}/send`)
        .set("Cookie", cookie);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("sent");
      const sender = mockedMailInvoice.mock.calls[0][2];
      expect(sender).toMatchObject({ transport: "gmail", email: testUser.email });
      // The access token comes from the stored Google account, decrypted by better-auth
      expect(sender.transport === "gmail" && (await sender.accessToken())).toBe("google-access-token");
      const stored = await getDb()
        .selectFrom("auth_accounts")
        .select("accessToken")
        .executeTakeFirstOrThrow();
      expect(stored.accessToken).not.toBe("google-access-token");
    });

    it("answers 401 without a signed-in account, even where auth is optional", async () => {
      const invoice = await createInvoice();

      const response = await request(app.getHttpServer()).post(`/api/invoices/${invoice.id}/send`);

      expect(response.status).toBe(401);
      expect(mockedMailInvoice).not.toHaveBeenCalled();
    });
  });
});
