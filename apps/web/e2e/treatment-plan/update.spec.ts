import { patientFactory } from "@api/factories/patient";
import { treatmentPlanFactory, treatmentGoalFactory } from "@api/factories/treatmentPlan";
import { test, expect } from "../fixtures";

test("shows existing plan values on load", async ({ page }) => {
  const patient = await patientFactory.create();
  await treatmentPlanFactory.create({
    patientId: patient.id,
    therapyForm: "Gruppentherapie",
    phase: "Therapiephase",
    startDate: "2024-03-01",
    notes: "Bestehende Notiz",
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await expect(page.getByRole("textbox", { name: "Beginn" })).toHaveValue("2024-03-01");
  await expect(page.getByRole("textbox", { name: "Notizen" })).toHaveValue("Bestehende Notiz");
});

test("updates an existing treatment plan", async ({ page }) => {
  const patient = await patientFactory.create();
  await treatmentPlanFactory.create({
    patientId: patient.id,
    startDate: "2024-01-01",
    notes: "Alt",
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await page.getByRole("textbox", { name: "Notizen" }).fill("Neu");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Notizen" })).toHaveValue("Neu");
});

test("shows existing goals on load", async ({ page }) => {
  const patient = await patientFactory.create();
  const plan = await treatmentPlanFactory.create({ patientId: patient.id });
  await treatmentGoalFactory.create({
    treatmentPlanId: plan.id,
    description: "Schlafqualität verbessern",
    status: "active",
    priority: 1,
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await expect(
    page.getByRole("textbox", { name: "Beschreibung" })
  ).toHaveValue("Schlafqualität verbessern");
});

test("removes a goal and saves", async ({ page }) => {
  const patient = await patientFactory.create();
  const plan = await treatmentPlanFactory.create({ patientId: patient.id });
  await treatmentGoalFactory.create({
    treatmentPlanId: plan.id,
    description: "Ziel zum Löschen",
    status: "active",
    priority: 1,
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await expect(page.getByRole("textbox", { name: "Beschreibung" })).toBeVisible();

  await page.getByRole("button", { name: "Ziel entfernen" }).click();
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Beschreibung" })).not.toBeVisible();
});
