import { test, expect } from "../fixtures";
import { api } from "../support/mockApi";
import { fake, page as resultPage } from "../support/factories";

// A minimal valid PDF for the form's preview
const PDF = Buffer.from("%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");

test("creates an invoice", async ({ page, mock }) => {
  const patient = fake.invoicePatient({ name: "Max", surname: "Mustermann" });
  const service = fake.billableService({
    short: "Super short",
    amounts: [
      { factor: "1.0", price: 10 },
      { factor: "2.3", price: 23 },
    ],
  });
  mock.use(api.invoices.filter.handler(() => resultPage([])));
  // After saving, the UI opens the new invoice. Registered first: later handlers win, and
  // /invoices/{id} would otherwise also claim /invoices/patients and the other static routes
  const created = fake.invoice({ invoiceNumber: "20241010001", patient });
  mock.use(api.invoices.find.handler(() => created));
  mock.use(api.invoices.findPatients.handler(() => [patient]));
  mock.use(api.invoices.findBillableServices.handler(() => [service]));
  mock.use(api.invoices.generateInvoiceNumber.handler(() => "20241010001"));
  mock.use(api.invoices.findIssuer.handler(() => fake.issuer()));
  mock.use(api.invoices.generatePdf.handler(() => new File([PDF], "20241010001.pdf", { type: "application/pdf" })));
  const create: Record<string, unknown>[] = [];
  mock.use(
    api.invoices.create.handler(({ input }) => {
      create.push(input);
      return { ...created, ...input };
    }),
  );

  await page.goto("/administration/invoices");
  await page.getByRole("button", { name: "Rechnung anlegen" }).click();
  await expect(page.getByRole("heading", { name: "Rechnung erstellen" })).toBeVisible();

  await page.getByRole("combobox", { name: "Patient" }).first().click();
  await page.getByRole("option", { name: patient.name }).click();

  const dateGroup = page.getByRole("group", { name: "Leistungs Datum" });
  await dateGroup.getByRole("spinbutton", { name: "Tag" }).fill("10");
  await dateGroup.getByRole("spinbutton", { name: "Monat" }).fill("10");
  await dateGroup.getByRole("spinbutton", { name: "Jahr" }).fill("2024");

  await page.getByRole("combobox", { name: "Leistung" }).click();
  await page.getByRole("option", { name: service.short }).click();

  // The preview PDF is generated (debounced) before the invoice can be saved
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Anlegen" }).click();

  await expect(page.getByRole("alert").getByText("Rechnung wurde gespeichert")).toBeVisible();
  const [body] = create;
  expect(body).toMatchObject({
    invoiceNumber: "20241010001",
    status: "pending",
    patient: { id: patient.id },
    positions: [expect.objectContaining({ serviceDate: "2024-10-10", service: expect.objectContaining({ id: service.id }) })],
    base64Pdf: PDF.toString("base64"),
  });
});
