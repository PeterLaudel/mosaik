import type { Session } from "@peterlaudel/mosaik-contract";
import { test, expect } from "../fixtures";
import { page as resultPage, patientFactory, sessionFactory } from "../support/factories";

test("shows the previous session's homework for review in a new session", async ({ page, mockApi }) => {
  const patient = patientFactory.build({ name: "Maria", surname: "Schmidt" });
  // The API copies the previous session's given homework into the new draft for review
  const draft = sessionFactory.build({
    id: 77,
    sessionNumber: 2,
    status: "draft",
    reviewHomework: [{ description: "Entspannungsübungen täglich", status: "open" }],
  });
  await mockApi.patients.find.returns(patient);
  await mockApi.sessions.filter.returns(resultPage([]));
  await mockApi.sessions.findOpenSession.returns(null);
  await mockApi.sessions.createDraft.returns(draft);
  await mockApi.sessions.find.returns(draft);
  await mockApi.treatmentPlans.findByPatientId.returns(null);
  await mockApi.sessions.findPreviousSession.returns(null);

  await page.goto(`/administration/patients/${patient.id}/sessions`);
  await page.getByRole("button", { name: "Sitzung starten" }).click();
  await expect(page).toHaveURL(`/administration/patients/${patient.id}/sessions/${draft.id}`, { timeout: 5000 });

  await expect(page.getByText("Hausaufgaben — Rückschau")).toBeVisible();
  await expect(page.getByText("Entspannungsübungen täglich")).toBeVisible();
});

test("updates homework review status via toggle and it autosaves", async ({ page, mockApi }) => {
  const session = sessionFactory.build({
    sessionNumber: 2,
    status: "draft",
    reviewHomework: [{ description: "Tagebuch führen", status: "open" }],
  });
  await mockApi.sessions.find.returns(session);
  await mockApi.treatmentPlans.findByPatientId.returns(null);
  await mockApi.sessions.findPreviousSession.returns(null);
  const update = await mockApi.sessions.update.answers(({ id, ...data }) => ({ ...session, ...data, id: id ?? session.id }) as Session);

  await page.goto(`/administration/patients/${session.patient.id}/sessions/${session.id}`);
  await expect(page.getByText("Hausaufgaben — Rückschau")).toBeVisible();
  await page.getByRole("button", { name: "Erledigt", exact: true }).click();

  await expect(page.getByText("Entwurf gespeichert")).toBeVisible({ timeout: 5000 });
  const calls = await update.calls();
  expect(calls.at(-1)?.reviewHomework).toEqual([{ description: "Tagebuch führen", status: "done" }]);
});
