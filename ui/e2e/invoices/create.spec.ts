import { test, expect } from "../fixtures";
import {
  billableServiceFactory,
  invoiceFactory,
  invoicePatientFactory,
  issuerFactory,
  page as resultPage,
} from "../support/factories";

// A minimal valid PDF for the form's preview
const PDF = Buffer.from("%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");

test("creates an invoice", async ({ page, mockApi }) => {
  const patient = invoicePatientFactory.build({ name: "Max", surname: "Mustermann" });
  const service = billableServiceFactory.build({
    short: "Super short",
    amounts: [
      { factor: "1.0", price: 10 },
      { factor: "2.3", price: 23 },
    ],
  });
  await mockApi.invoices.filter.returns(resultPage([]));
  await mockApi.invoices.findPatients.returns([patient]);
  await mockApi.invoices.findBillableServices.returns([service]);
  await mockApi.invoices.generateInvoiceNumber.returns("20241010001");
  await mockApi.invoices.findIssuer.returns(issuerFactory.build());
  await mockApi.invoices.generatePdf.replies(200, PDF, {
    "content-type": "application/pdf",
    "content-disposition": 'inline; filename="20241010001.pdf"',
  });
  const created = invoiceFactory.build({ invoiceNumber: "20241010001", patient });
  const create = await mockApi.invoices.create.answers((input) => ({ ...created, ...input }));
  // After saving, the UI opens the new invoice
  await mockApi.invoices.find.returns(created);

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
  const [body] = await create.calls();
  expect(body).toMatchObject({
    invoiceNumber: "20241010001",
    status: "pending",
    patient: { id: patient.id },
    positions: [expect.objectContaining({ serviceDate: "2024-10-10", service: expect.objectContaining({ id: service.id }) })],
    base64Pdf: PDF.toString("base64"),
  });
});
