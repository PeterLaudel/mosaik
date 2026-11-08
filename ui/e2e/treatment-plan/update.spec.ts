import type { TreatmentPlan } from "@peterlaudel/mosaik-contract";
import type { Mock } from "../fixtures";
import { test, expect } from "../fixtures";
import { api } from "../support/mockApi";
import { fake } from "../support/factories";

function patientWithPlan(mock: Mock, overrides: Partial<TreatmentPlan>) {
  const patient = fake.patient();
  const plan = fake.treatmentPlan({ ...overrides, patient: { id: patient.id } });
  mock.use(api.patients.find.handler(() => patient));
  mock.use(api.treatmentPlans.findByPatientId.handler(() => plan));
  const update: Record<string, unknown>[] = [];
  mock.use(
    api.treatmentPlans.update.handler(({ input }) => {
      update.push(input);
      return { ...plan, ...input };
    }),
  );
  return { patient, plan, update };
}

test("shows existing plan values on load", async ({ page, mock }) => {
  const { patient } = patientWithPlan(mock, {
    therapyForm: "Gruppentherapie",
    phase: "Therapiephase",
    startDate: "2024-03-01",
    notes: "Bestehende Notiz",
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await expect(page.getByRole("textbox", { name: "Beginn" })).toHaveValue("2024-03-01");
  await expect(page.getByRole("textbox", { name: "Notizen" })).toHaveValue("Bestehende Notiz");
});

test("updates an existing treatment plan", async ({ page, mock }) => {
  const { patient, plan, update } = patientWithPlan(mock, { startDate: "2024-01-01", notes: "Alt" });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await page.getByRole("textbox", { name: "Notizen" }).fill("Neu");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
  const [body] = update;
  expect(body).toMatchObject({ id: plan.id, notes: "Neu", startDate: "2024-01-01" });
});

test("shows existing goals on load", async ({ page, mock }) => {
  const { patient } = patientWithPlan(mock, {
    goals: [{ description: "Schlafqualität verbessern", status: "active", priority: 1 }],
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await expect(page.getByRole("textbox", { name: "Beschreibung" })).toHaveValue("Schlafqualität verbessern");
});

test("removes a goal and saves", async ({ page, mock }) => {
  const { patient, update } = patientWithPlan(mock, {
    goals: [{ description: "Ziel zum Löschen", status: "active", priority: 1 }],
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await expect(page.getByRole("textbox", { name: "Beschreibung" })).toBeVisible();
  await page.getByRole("button", { name: "Ziel entfernen" }).click();
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Beschreibung" })).not.toBeVisible();
  const [body] = update;
  expect(body?.goals).toEqual([]);
});
