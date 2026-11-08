import type { Session } from "@peterlaudel/mosaik-contract";
import type { Mock } from "../fixtures";
import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

const DRAFT_ID = 42;

function patientWithoutSessions(mock: Mock) {
  const patient = fake.patient({ name: "Anna", surname: "Müller" });
  const draft = fake.session({ id: DRAFT_ID, sessionNumber: 1, status: "draft" });
  mock.patients.find(patient);
  mock.sessions.filter(resultPage([]));
  mock.sessions.findOpenSession(null);
  const createDraft: Record<string, unknown>[] = [];
  mock.sessions.createDraft(({ input }) => {
    createDraft.push(input);
    return draft;
  });
  // The session page after the redirect
  mock.sessions.find(draft);
  mock.treatmentPlans.findByPatientId(null);
  mock.sessions.findPreviousSession(null);
  const update: Record<string, unknown>[] = [];
  mock.sessions.update(({ input }) => {
    update.push(input);
    return { ...draft, ...input } as Session;
  });
  return { patient, createDraft, update };
}

test("creates a session from the patient sessions page", async ({ page, mock }) => {
  const { patient, createDraft } = patientWithoutSessions(mock);

  await page.goto(`/administration/patients/${patient.id}/sessions`);
  await page.getByRole("button", { name: "Sitzung starten" }).click();

  await expect(page).toHaveURL(`/administration/patients/${patient.id}/sessions/${DRAFT_ID}`, { timeout: 5000 });
  await expect(page.getByRole("spinbutton", { name: "Sitzungsnummer" })).toHaveValue("1");
  const [body] = createDraft;
  expect(body).toMatchObject({ patientId: patient.id });
});

test("creates and finalizes a session", async ({ page, mock }) => {
  const { patient, update } = patientWithoutSessions(mock);

  await page.goto(`/administration/patients/${patient.id}/sessions`);
  await page.getByRole("button", { name: "Sitzung starten" }).click();
  await expect(page).toHaveURL(`/administration/patients/${patient.id}/sessions/${DRAFT_ID}`, { timeout: 5000 });

  await page.getByRole("button", { name: "Kein" }).click();
  await page.getByRole("textbox", { name: "Notizen (verschlüsselt)" }).fill("Erste Sitzung.");
  await page.getByRole("button", { name: "Abschließen" }).click();

  await expect(page.getByRole("button", { name: "Abschließen" })).toBeDisabled();
  await expect.poll(() => update.some((call) => call.status === "final")).toBe(true);
  const final = update.find((call) => call.status === "final");
  expect(final).toMatchObject({ id: DRAFT_ID, riskLevel: "none", clinicalNotes: "Erste Sitzung." });
});
