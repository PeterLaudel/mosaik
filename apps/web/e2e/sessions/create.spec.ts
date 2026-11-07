import { patientFactory } from "@api/factories/patient";
import { test, expect } from "../fixtures";

test("creates a session from the patient sessions page", async ({ page }) => {
  const patient = await patientFactory.create({ name: "Anna", surname: "Müller" });

  await page.goto(`/administration/patients/${patient.id}/sessions`);
  await page.getByRole("button", { name: "Sitzung starten" }).click();

  await expect(page).toHaveURL(
    new RegExp(`/administration/patients/${patient.id}/sessions/\\d+`),
    { timeout: 5000 }
  );
  await expect(
    page.getByRole("spinbutton", { name: "Sitzungsnummer" })
  ).toHaveValue("1");
});

test("creates and finalizes a session", async ({ page }) => {
  const patient = await patientFactory.create({ name: "Anna", surname: "Müller" });

  await page.goto(`/administration/patients/${patient.id}/sessions`);
  await page.getByRole("button", { name: "Sitzung starten" }).click();

  await expect(page).toHaveURL(
    new RegExp(`/administration/patients/${patient.id}/sessions/\\d+`),
    { timeout: 5000 }
  );

  await page.getByRole("button", { name: "Kein" }).click();
  await page
    .getByRole("textbox", { name: "Notizen (verschlüsselt)" })
    .fill("Erste Sitzung.");
  await page.getByRole("button", { name: "Abschließen" }).click();

  await expect(page.getByRole("button", { name: "Abschließen" })).toBeDisabled();
});
