import { test, expect } from "../fixtures";

test("creates a service", async ({ page }) => {
  await page.goto("/administration/services");

  await page.getByRole("button", { name: "Leistung anlegen" }).click();

  await expect(page.getByRole("heading", { name: "Leistung anlegen" })).toBeVisible();

  await page.getByLabel("Kürzel").fill("GOP-1");
  await page.getByLabel("GOP-Nr").fill("1234");
  await page.getByLabel("Beschreibung").fill("Test Beschreibung");
  await page.getByLabel("Punkte").fill("200");

  await page.getByRole("button", { name: "Anlegen" }).click();

  await expect(page.getByText("Leistung gespeichert")).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "GOP-1" })).toBeVisible();
});
