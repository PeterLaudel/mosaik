import type { Mock } from "../fixtures";
import { test, expect } from "../fixtures";
import { fake } from "../support/factories";

const CREATED_PLAN_ID = 501;

function patientWithoutPlan(mock: Mock) {
  const patient = fake.patient();
  mock.patients.find(patient);
  mock.treatmentPlans.findByPatientId(null);
  const create: Record<string, unknown>[] = [];
  mock.treatmentPlans.create(({ input }) => {
    create.push(input);
    const { patientId, ...data } = input;
    return fake.treatmentPlan({ ...data, id: CREATED_PLAN_ID, patient: { id: patientId } });
  });
  return { patient, create };
}

test("shows empty form for a patient with no treatment plan", async ({ page, mock }) => {
  const { patient } = patientWithoutPlan(mock);

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await expect(page.getByRole("heading", { name: "Behandlungsplan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible();
});

test("creates a treatment plan and shows success message", async ({ page, mock }) => {
  const { patient, create } = patientWithoutPlan(mock);

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await page.getByRole("textbox", { name: "Beginn" }).fill("2024-01-15");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
  const [body] = create;
  expect(body).toMatchObject({ patientId: patient.id, startDate: "2024-01-15" });
});

test("adds a goal and saves the plan", async ({ page, mock }) => {
  const { patient, create } = patientWithoutPlan(mock);

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await page.getByRole("textbox", { name: "Beginn" }).fill("2024-01-15");
  await page.getByRole("button", { name: "+ Therapieziel hinzufügen" }).click();
  await page.getByRole("textbox", { name: "Beschreibung" }).fill("Angststörung reduzieren");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Beschreibung" })).toHaveValue("Angststörung reduzieren");
  const [body] = create;
  expect(body?.goals).toEqual([
    expect.objectContaining({ description: "Angststörung reduzieren", status: "active" }),
  ]);
});

test("second save updates instead of creating a duplicate", async ({ page, mock }) => {
  const { patient, create } = patientWithoutPlan(mock);
  const update: Record<string, unknown>[] = [];
  mock.treatmentPlans.update(({ input }) => {
    update.push(input);
    return fake.treatmentPlan({ ...input, patient: { id: patient.id } });
  });

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await page.getByRole("textbox", { name: "Beginn" }).fill("2024-01-15");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();

  await page.getByRole("textbox", { name: "Notizen" }).fill("Zweite Speicherung");
  await page.getByRole("button", { name: "Speichern" }).click();

  // The first save's snackbar may still be showing, so wait for the request itself
  await expect.poll(() => update.length).toBe(1);
  expect(create).toHaveLength(1);
  const updates = update;
  expect(updates[0]).toMatchObject({ id: CREATED_PLAN_ID, notes: "Zweite Speicherung", startDate: "2024-01-15" });
});
