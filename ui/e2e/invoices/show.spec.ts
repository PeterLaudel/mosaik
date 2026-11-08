import { test, expect } from "../fixtures";
import { invoiceFactory, invoicePatientFactory, page as resultPage } from "../support/factories";

function invoicesFor() {
  const jane = invoiceFactory.build({
    invoiceAmount: 100,
    status: "paid",
    patient: invoicePatientFactory.build({ name: "Jane", surname: "Doe" }),
  });
  const john = invoiceFactory.build({
    invoiceAmount: 200,
    status: "sent",
    patient: invoicePatientFactory.build({ name: "John", surname: "Doe" }),
  });
  return { jane, john };
}

test("filter invoices", async ({ page, mockApi }) => {
  const { jane, john } = invoicesFor();
  await mockApi.invoices.filter.returns(resultPage([jane, john]));

  await page.goto("/administration/invoices");
  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).toBeVisible();

  const filter = await mockApi.invoices.filter.returns(resultPage([jane]));
  await page.getByRole("textbox", { name: "Suche" }).fill("Jane");

  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).not.toBeVisible();
  const calls = await filter.calls();
  expect(calls.at(-1)).toMatchObject({ search: "Jane" });
});

test("filter invoices by status", async ({ page, mockApi }) => {
  const { jane, john } = invoicesFor();
  await mockApi.invoices.filter.returns(resultPage([jane, john]));

  await page.goto("/administration/invoices");
  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).toBeVisible();

  const filter = await mockApi.invoices.filter.returns(resultPage([jane]));
  await page.getByRole("combobox", { name: "Status" }).click();
  await page.getByRole("option", { name: "Bezahlt" }).click();

  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).not.toBeVisible();
  const calls = await filter.calls();
  expect(calls.at(-1)).toMatchObject({ status: "paid" });
});
