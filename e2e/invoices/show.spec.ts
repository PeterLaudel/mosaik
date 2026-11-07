import { invoiceFactory } from "factories/invoices";
import { test, expect } from "../fixtures";
import { patientFactory } from "factories/patients";
import { patientInvoiceFactory } from "factories/patientInvoices";

test("filter invoices", async ({ page }) => {
  const patient1 = await patientFactory.create({ name: "Jane", surname: "Doe" });
  const patient2 = await patientFactory.create({ name: "John", surname: "Doe" });

  const invoice1 = await invoiceFactory.create({ invoiceAmount: 100 });
  const invoice2 = await invoiceFactory.create({ invoiceAmount: 200 });

  await patientInvoiceFactory.create({ patientId: patient1.id, invoiceId: invoice1.id });
  await patientInvoiceFactory.create({ patientId: patient2.id, invoiceId: invoice2.id });

  await page.goto("/administration/invoices");

  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).toBeVisible();

  await page.getByRole('textbox', { name: 'Suche' }).fill("Jane");

  await page.waitForResponse("/api/invoices*");

  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).not.toBeVisible();
});

test("filter invoices by status", async ({ page }) => {
  const patient1 = await patientFactory.create({ name: "Jane", surname: "Doe" });
  const patient2 = await patientFactory.create({ name: "John", surname: "Doe" });

  const invoice1 = await invoiceFactory.create({ invoiceAmount: 100, status: "paid" });
  const invoice2 = await invoiceFactory.create({ invoiceAmount: 200, status: "sent" });

  await patientInvoiceFactory.create({ patientId: patient1.id, invoiceId: invoice1.id });
  await patientInvoiceFactory.create({ patientId: patient2.id, invoiceId: invoice2.id });

  await page.goto("/administration/invoices");

  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).toBeVisible();

  await page.getByRole('combobox', { name: 'Status' }).click();

  await page.getByRole('option', { name: 'Bezahlt' }).click();

  await page.waitForResponse("/api/invoices*");
  
  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).not.toBeVisible();
});
