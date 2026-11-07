import { patientFactory } from "@api/factories/patient";
import { test, expect } from "../fixtures";

test("shows empty form for a patient with no treatment plan", async ({ page }) => {
  const patient = await patientFactory.create();

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await expect(page.getByRole("heading", { name: "Behandlungsplan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible();
});

test("creates a treatment plan and shows success message", async ({ page }) => {
  const patient = await patientFactory.create();

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await page.getByRole("textbox", { name: "Beginn" }).fill("2024-01-15");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
});

test("adds a goal and saves the plan", async ({ page }) => {
  const patient = await patientFactory.create();

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await page.getByRole("textbox", { name: "Beginn" }).fill("2024-01-15");
  await page.getByRole("button", { name: "+ Therapieziel hinzufügen" }).click();
  await page.getByRole("textbox", { name: "Beschreibung" }).fill("Angststörung reduzieren");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Beschreibung" })).toHaveValue("Angststörung reduzieren");
});

test("second save updates instead of creating a duplicate", async ({ page }) => {
  const patient = await patientFactory.create();

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await page.getByRole("textbox", { name: "Beginn" }).fill("2024-01-15");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();

  await page.getByRole("textbox", { name: "Notizen" }).fill("Zweite Speicherung");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();

  // Only one plan should exist — navigating away and back still shows the notes
  await page.goto(`/administration/patients/${patient.id}`);
  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await expect(page.getByRole("textbox", { name: "Notizen" })).toHaveValue("Zweite Speicherung");
});
