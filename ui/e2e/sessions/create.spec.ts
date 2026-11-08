import type { Session } from "@peterlaudel/mosaik-contract";
import type { MockApi } from "../support/mockApi";
import { test, expect } from "../fixtures";
import { page as resultPage, patientFactory, sessionFactory } from "../support/factories";

const DRAFT_ID = 42;

async function patientWithoutSessions(mockApi: MockApi) {
  const patient = patientFactory.build({ name: "Anna", surname: "Müller" });
  const draft = sessionFactory.build({ id: DRAFT_ID, sessionNumber: 1, status: "draft" });
  await mockApi.patients.find.returns(patient);
  await mockApi.sessions.filter.returns(resultPage([]));
  await mockApi.sessions.findOpenSession.returns(null);
  const createDraft = await mockApi.sessions.createDraft.returns(draft);
  // The session page after the redirect
  await mockApi.sessions.find.returns(draft);
  await mockApi.treatmentPlans.findByPatientId.returns(null);
  await mockApi.sessions.findPreviousSession.returns(null);
  const update = await mockApi.sessions.update.answers(({ id, ...data }) => ({ ...draft, ...data, id: id ?? DRAFT_ID }) as Session);
  return { patient, createDraft, update };
}

test("creates a session from the patient sessions page", async ({ page, mockApi }) => {
  const { patient, createDraft } = await patientWithoutSessions(mockApi);

  await page.goto(`/administration/patients/${patient.id}/sessions`);
  await page.getByRole("button", { name: "Sitzung starten" }).click();

  await expect(page).toHaveURL(`/administration/patients/${patient.id}/sessions/${DRAFT_ID}`, { timeout: 5000 });
  await expect(page.getByRole("spinbutton", { name: "Sitzungsnummer" })).toHaveValue("1");
  const [body] = await createDraft.calls();
  expect(body).toMatchObject({ patientId: patient.id });
});

test("creates and finalizes a session", async ({ page, mockApi }) => {
  const { patient, update } = await patientWithoutSessions(mockApi);

  await page.goto(`/administration/patients/${patient.id}/sessions`);
  await page.getByRole("button", { name: "Sitzung starten" }).click();
  await expect(page).toHaveURL(`/administration/patients/${patient.id}/sessions/${DRAFT_ID}`, { timeout: 5000 });

  await page.getByRole("button", { name: "Kein" }).click();
  await page.getByRole("textbox", { name: "Notizen (verschlüsselt)" }).fill("Erste Sitzung.");
  await page.getByRole("button", { name: "Abschließen" }).click();

  await expect(page.getByRole("button", { name: "Abschließen" })).toBeDisabled();
  await expect
    .poll(async () => (await update.calls()).some((call) => call.status === "final"))
    .toBe(true);
  const calls = await update.calls();
  const final = calls.find((call) => call.status === "final");
  expect(final).toMatchObject({ id: DRAFT_ID, riskLevel: "none", clinicalNotes: "Erste Sitzung." });
});
