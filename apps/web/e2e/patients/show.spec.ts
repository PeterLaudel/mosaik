import { patientFactory } from "@api/factories/patient";
import { test, expect } from "../fixtures";

test("filter patients", async ({ page }) => {
  await patientFactory.create({ name: "Jane", surname: "Doe" });
  await patientFactory.create({ name: "John", surname: "Doe" });

  await page.goto("/administration/patients");

  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).toBeVisible();

  await page.getByRole("textbox", { name: "Suche" }).fill("Jane");

  await page.waitForResponse("/api/patients*");

  await expect(page.getByText("John")).not.toBeVisible();
  await expect(page.getByText("Jane")).toBeVisible();
});
