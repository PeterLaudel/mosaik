import { sessionFactory } from "factories/sessions";
import { test, expect } from "../fixtures";

test("shows the pseudonymized text and confirms once pseudonymization is done", async ({ page }) => {
  const session = await sessionFactory.create({
    status: "final",
    pseudonymizationStatus: "done",
    pseudonymizedNotes: "Pseudonymisierte Notiz",
    pseudonymizedNextPlan: "Pseudonymisierter Plan",
  });

  await page.goto(`/administration/patients/${session.patientId}/reports`);
  await page.getByRole("checkbox", { name: "Select row" }).click();
  await page.getByRole("button", { name: "Bericht generieren" }).click();

  await expect(page.getByText("Datenschutz-Prüfung")).toBeVisible();
  const textarea = page.getByRole("textbox", { name: "Pseudonymisierter Text" });
  await expect(textarea).toHaveValue(/Pseudonymisierte Notiz/);
  await expect(textarea).toHaveValue(/Pseudonymisierter Plan/);

  await page.getByRole("button", { name: "Bestätigen & Bericht erstellen" }).click();

  await expect(page.getByText("Datenschutz-Prüfung bestätigt")).toBeVisible();
});

test("disables confirmation while pseudonymization is still pending", async ({ page }) => {
  const session = await sessionFactory.create({
    status: "final",
    pseudonymizationStatus: "pending",
  });

  await page.goto(`/administration/patients/${session.patientId}/reports`);
  await page.getByRole("checkbox", { name: "Select row" }).click();
  await page.getByRole("button", { name: "Bericht generieren" }).click();

  await expect(page.getByText("Pseudonymisierung läuft")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Bestätigen & Bericht erstellen" })
  ).toBeDisabled();
});

test("shows a warning and disables confirmation when pseudonymization failed", async ({ page }) => {
  const session = await sessionFactory.create({
    status: "final",
    pseudonymizationStatus: "failed",
  });

  await page.goto(`/administration/patients/${session.patientId}/reports`);
  await page.getByRole("checkbox", { name: "Select row" }).click();
  await page.getByRole("button", { name: "Bericht generieren" }).click();

  await expect(page.getByText("Pseudonymisierung fehlgeschlagen")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Bestätigen & Bericht erstellen" })
  ).toBeDisabled();
});
