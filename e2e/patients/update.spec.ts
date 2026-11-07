import { patientFactory } from "factories/patients";
import { test, expect } from "../fixtures";

test("updates patient", async ({ page }) => {
  const patient = await patientFactory.create({
    name: "Maximilian",
    surname: "Thorsten",
    
  });

  await page.goto("/administration/patients");

  await page.getByText(patient.surname, { exact: true }).click();

  await expect(page.getByText("Patientendaten")).toBeVisible();

  await page.getByRole("textbox", { name: "Vorname" }).first().fill("Max");

  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(
    page.getByRole("gridcell", { name: "Max", exact: true })
  ).toBeVisible();
});
