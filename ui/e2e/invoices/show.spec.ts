import { test, expect } from "../fixtures";
import { api } from "../support/mockApi";
import { fake, page as resultPage } from "../support/factories";

function invoicesFor() {
  const jane = fake.invoice({
    invoiceAmount: 100,
    status: "paid",
    patient: fake.invoicePatient({ name: "Jane", surname: "Doe" }),
  });
  const john = fake.invoice({
    invoiceAmount: 200,
    status: "sent",
    patient: fake.invoicePatient({ name: "John", surname: "Doe" }),
  });
  return { jane, john };
}

test("filter invoices", async ({ page, mock }) => {
  const { jane, john } = invoicesFor();
  mock.use(api.invoices.filter.handler(() => resultPage([jane, john])));

  await page.goto("/administration/invoices");
  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).toBeVisible();

  const filter: Record<string, unknown>[] = [];
  mock.use(
    api.invoices.filter.handler(({ input }) => {
      filter.push(input);
      return resultPage([jane]);
    }),
  );
  await page.getByRole("textbox", { name: "Suche" }).fill("Jane");

  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).not.toBeVisible();
  const calls = filter;
  expect(calls.at(-1)).toMatchObject({ search: "Jane" });
});

test("filter invoices by status", async ({ page, mock }) => {
  const { jane, john } = invoicesFor();
  mock.use(api.invoices.filter.handler(() => resultPage([jane, john])));

  await page.goto("/administration/invoices");
  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).toBeVisible();

  const filter: Record<string, unknown>[] = [];
  mock.use(
    api.invoices.filter.handler(({ input }) => {
      filter.push(input);
      return resultPage([jane]);
    }),
  );
  await page.getByRole("combobox", { name: "Status" }).click();
  await page.getByRole("option", { name: "Bezahlt" }).click();

  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).not.toBeVisible();
  const calls = filter;
  expect(calls.at(-1)).toMatchObject({ status: "paid" });
});
