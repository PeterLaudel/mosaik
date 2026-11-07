import { serviceFactory } from "factories/services";
import { test, expect } from "../fixtures";

test("updates a service", async ({ page }) => {
  const service = await serviceFactory.create({
    description: "Old description",
  });

  await page.goto("/administration/services");

  await page.getByRole("gridcell", { name: service.short }).click();

  await page.waitForURL("/administration/services/" + service.id);

  await expect(page.getByRole("heading", { name: "Leistung bearbeiten" })).toBeVisible();

  await page.getByLabel("Beschreibung").fill("New description");

  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Leistung gespeichert")).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "New description" })).toBeVisible();
});
