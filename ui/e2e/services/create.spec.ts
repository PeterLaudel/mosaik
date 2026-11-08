import { test, expect } from "../fixtures";
import { page as resultPage, serviceFactory } from "../support/factories";

test("creates a service", async ({ page, mockApi }) => {
  await mockApi.services.filter.returns(resultPage([]));
  const create = await mockApi.services.create.answers((input) => serviceFactory.build(input));

  await page.goto("/administration/services");
  await page.getByRole("button", { name: "Leistung anlegen" }).click();
  await expect(page.getByRole("heading", { name: "Leistung anlegen" })).toBeVisible();

  await page.getByLabel("Kürzel").fill("GOP-1");
  await page.getByLabel("GOP-Nr").fill("1234");
  await page.getByLabel("Beschreibung").fill("Test Beschreibung");
  await page.getByLabel("Punkte").fill("200");

  await mockApi.services.filter.returns(resultPage([serviceFactory.build({ short: "GOP-1" })]));
  await page.getByRole("button", { name: "Anlegen" }).click();

  await expect(page.getByText("Leistung gespeichert")).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "GOP-1" })).toBeVisible();
  const [body] = await create.calls();
  expect(body).toMatchObject({
    short: "GOP-1",
    originalGopNr: "1234",
    description: "Test Beschreibung",
    points: 200,
  });
});
