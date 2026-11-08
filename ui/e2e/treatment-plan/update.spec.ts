import type { TreatmentPlan } from "@peterlaudel/mosaik-contract";
import type { MockApi } from "../support/mockApi";
import { test, expect } from "../fixtures";
import { fake } from "../support/factories";

async function patientWithPlan(mockApi: MockApi, overrides: Partial<TreatmentPlan>) {
  const patient = fake.patient();
  const plan = fake.treatmentPlan({ ...overrides, patient: { id: patient.id } });
  await mockApi.patients.find.returns(patient);
  await mockApi.treatmentPlans.findByPatientId.returns(plan);
  const update = await mockApi.treatmentPlans.update.returns(({ id, ...data }) => ({
    ...plan,
    ...data,
    id: id ?? plan.id,
  }));
  return { patient, plan, update };
}

test("shows existing plan values on load", async ({ page, mockApi }) => {
  const { patient } = await patientWithPlan(mockApi, {
    therapyForm: "Gruppentherapie",
    phase: "Therapiephase",
    startDate: "2024-03-01",
    notes: "Bestehende Notiz",
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await expect(page.getByRole("textbox", { name: "Beginn" })).toHaveValue("2024-03-01");
  await expect(page.getByRole("textbox", { name: "Notizen" })).toHaveValue("Bestehende Notiz");
});

test("updates an existing treatment plan", async ({ page, mockApi }) => {
  const { patient, plan, update } = await patientWithPlan(mockApi, { startDate: "2024-01-01", notes: "Alt" });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await page.getByRole("textbox", { name: "Notizen" }).fill("Neu");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
  const [body] = await update.calls();
  expect(body).toMatchObject({ id: plan.id, notes: "Neu", startDate: "2024-01-01" });
});

test("shows existing goals on load", async ({ page, mockApi }) => {
  const { patient } = await patientWithPlan(mockApi, {
    goals: [{ description: "Schlafqualität verbessern", status: "active", priority: 1 }],
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await expect(page.getByRole("textbox", { name: "Beschreibung" })).toHaveValue("Schlafqualität verbessern");
});

test("removes a goal and saves", async ({ page, mockApi }) => {
  const { patient, update } = await patientWithPlan(mockApi, {
    goals: [{ description: "Ziel zum Löschen", status: "active", priority: 1 }],
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await expect(page.getByRole("textbox", { name: "Beschreibung" })).toBeVisible();
  await page.getByRole("button", { name: "Ziel entfernen" }).click();
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Beschreibung" })).not.toBeVisible();
  const [body] = await update.calls();
  expect(body?.goals).toEqual([]);
});
