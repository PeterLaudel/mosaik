import type { MockApi } from "../support/mockApi";
import { test, expect } from "../fixtures";
import { patientFactory, treatmentPlanFactory } from "../support/factories";

const CREATED_PLAN_ID = 501;

async function patientWithoutPlan(mockApi: MockApi) {
  const patient = patientFactory.build();
  await mockApi.patients.find.returns(patient);
  await mockApi.treatmentPlans.findByPatientId.returns(null);
  const create = await mockApi.treatmentPlans.create.answers(({ patientId, ...data }) =>
    treatmentPlanFactory.build({ ...data, id: CREATED_PLAN_ID, patient: { id: patientId } }),
  );
  return { patient, create };
}

test("shows empty form for a patient with no treatment plan", async ({ page, mockApi }) => {
  const { patient } = await patientWithoutPlan(mockApi);

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await expect(page.getByRole("heading", { name: "Behandlungsplan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible();
});

test("creates a treatment plan and shows success message", async ({ page, mockApi }) => {
  const { patient, create } = await patientWithoutPlan(mockApi);

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await page.getByRole("textbox", { name: "Beginn" }).fill("2024-01-15");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
  const [body] = await create.calls();
  expect(body).toMatchObject({ patientId: patient.id, startDate: "2024-01-15" });
});

test("adds a goal and saves the plan", async ({ page, mockApi }) => {
  const { patient, create } = await patientWithoutPlan(mockApi);

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await page.getByRole("textbox", { name: "Beginn" }).fill("2024-01-15");
  await page.getByRole("button", { name: "+ Therapieziel hinzufügen" }).click();
  await page.getByRole("textbox", { name: "Beschreibung" }).fill("Angststörung reduzieren");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Beschreibung" })).toHaveValue("Angststörung reduzieren");
  const [body] = await create.calls();
  expect(body?.goals).toEqual([
    expect.objectContaining({ description: "Angststörung reduzieren", status: "active" }),
  ]);
});

test("second save updates instead of creating a duplicate", async ({ page, mockApi }) => {
  const { patient, create } = await patientWithoutPlan(mockApi);
  const update = await mockApi.treatmentPlans.update.answers(({ id, ...data }) =>
    treatmentPlanFactory.build({ ...data, id, patient: { id: patient.id } }),
  );

  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);
  await page.getByRole("textbox", { name: "Beginn" }).fill("2024-01-15");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();

  await page.getByRole("textbox", { name: "Notizen" }).fill("Zweite Speicherung");
  await page.getByRole("button", { name: "Speichern" }).click();

  // The first save's snackbar may still be showing, so wait for the request itself
  await expect.poll(async () => (await update.calls()).length).toBe(1);
  expect(await create.calls()).toHaveLength(1);
  const updates = await update.calls();
  expect(updates[0]).toMatchObject({ id: CREATED_PLAN_ID, notes: "Zweite Speicherung", startDate: "2024-01-15" });
});
