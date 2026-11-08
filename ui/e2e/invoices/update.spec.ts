import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

test("sends an invoice by email", async ({ page, mockApi }) => {
  const invoice = fake.invoice({ status: "pending" });
  await mockApi.invoices.filter.returns(resultPage([invoice]));
  const send = await mockApi.invoices.sendByEmail.returns({ ...invoice, status: "sent" });

  await page.goto("/administration/invoices");
  await page.getByRole("button", { name: "Rechnung senden" }).click();
  // From now on the list comes back with the invoice sent
  await mockApi.invoices.filter.returns(resultPage([{ ...invoice, status: "sent" }]));
  await page.getByRole("button", { name: "Senden" }).click();

  await expect(page.getByText("Versendet")).toBeVisible();
  // What the mail contains is the API's job (covered by its tests); the UI asks it to send this one
  expect(await send.calls()).toEqual([{ id: invoice.id }]);
});
