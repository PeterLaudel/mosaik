import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

test("updates a service", async ({ page, mock }) => {
  const service = fake.service({ description: "Old description" });
  mock.services.filter(resultPage([service]));
  mock.services.find(service);
  const update: Record<string, unknown>[] = [];
  mock.services.update(({ input }) => {
    update.push(input);
    return { ...service, ...input };
  });

  await page.goto("/administration/services");
  await page.getByRole("gridcell", { name: service.short }).click();
  await page.waitForURL(`/administration/services/${service.id}`);
  await expect(page.getByRole("heading", { name: "Leistung bearbeiten" })).toBeVisible();

  await page.getByLabel("Beschreibung").fill("New description");
  mock.services.filter(resultPage([{ ...service, description: "New description" }]));
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Leistung gespeichert")).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "New description" })).toBeVisible();
  const [body] = update;
  expect(body).toMatchObject({ id: service.id, description: "New description" });
});
