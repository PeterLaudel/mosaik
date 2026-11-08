import { test, expect } from "../fixtures";
import { page as resultPage, serviceFactory } from "../support/factories";

test("updates a service", async ({ page, mockApi }) => {
  const service = serviceFactory.build({ description: "Old description" });
  await mockApi.services.filter.returns(resultPage([service]));
  await mockApi.services.find.returns(service);
  const update = await mockApi.services.update.answers((input) => ({ ...service, ...input }));

  await page.goto("/administration/services");
  await page.getByRole("gridcell", { name: service.short }).click();
  await page.waitForURL(`/administration/services/${service.id}`);
  await expect(page.getByRole("heading", { name: "Leistung bearbeiten" })).toBeVisible();

  await page.getByLabel("Beschreibung").fill("New description");
  await mockApi.services.filter.returns(resultPage([{ ...service, description: "New description" }]));
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Leistung gespeichert")).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "New description" })).toBeVisible();
  const [body] = await update.calls();
  expect(body).toMatchObject({ id: service.id, description: "New description" });
});
