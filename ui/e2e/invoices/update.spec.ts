import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

test("sends an invoice by email", async ({ page, mock }) => {
  const invoice = fake.invoice({ status: "pending" });
  mock.invoices.filter(resultPage([invoice]));
  const send: Record<string, unknown>[] = [];
  mock.invoices.sendByEmail(({ input }) => {
    send.push(input);
    return { ...invoice, status: "sent" };
  });

  await page.goto("/administration/invoices");
  await page.getByRole("button", { name: "Rechnung senden" }).click();
  // From now on the list comes back with the invoice sent
  mock.invoices.filter(resultPage([{ ...invoice, status: "sent" }]));
  await page.getByRole("button", { name: "Senden" }).click();

  await expect(page.getByText("Versendet")).toBeVisible();
  // What the mail contains is the API's job (covered by its tests); the UI asks it to send this one
  expect(send).toEqual([{ id: invoice.id }]);
});
