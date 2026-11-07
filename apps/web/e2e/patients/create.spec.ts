import { test, expect } from "../fixtures";

test("creates a patient", async ({ page }) => {
  await page.goto("/administration/patients");

  await page.getByRole("button", { name: "Patienten anlegen" }).click();

  await expect(page.getByText("Patienten anlegen")).toBeVisible();

  await page.getByRole("textbox", { name: "Vorname" }).first().fill("Max");
  await page
    .getByRole("textbox", { name: "Nachname" })
    .first()
    .fill("Mustermann");
  await page
    .getByRole("textbox", { name: "E-Mail" })
    .first()
    .fill("max.mustermann@example.com");

  await page
    .getByRole("group", { name: "Geburtsdatum" })
    .getByRole("spinbutton", { name: "Tag" })
    .fill("05");
  await page
    .getByRole("group", { name: "Geburtsdatum" })
    .getByRole("spinbutton", { name: "Monat" })
    .fill("05");
  await page
    .getByRole("group", { name: "Geburtsdatum" })
    .getByRole("spinbutton", { name: "Jahr" })
    .fill("1989");

  await page
    .getByRole("textbox", { name: "Straße" })
    .first()
    .fill("Musterstraße 1");
  await page.getByRole("textbox", { name: "PLZ" }).first().fill("12345");
  await page
    .getByRole("textbox", { name: "Stadt" })
    .first()
    .fill("Musterstadt");

  await page.getByRole("button", { name: "Anlegen" }).click();

  // expectation after creating a patient
  await expect(page.getByText("Patient wurde angelegt")).toBeVisible();
  await expect(
    page.getByRole("gridcell", { name: "Max", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("gridcell", { name: "Mustermann", exact: true }),
  ).toBeVisible();
});
