import type { Session } from "@peterlaudel/mosaik-contract";
import { test, expect } from "../fixtures";
import { api } from "../support/mockApi";
import { fake, page as resultPage } from "../support/factories";

test("shows the previous session's homework for review in a new session", async ({ page, mock }) => {
  const patient = fake.patient({ name: "Maria", surname: "Schmidt" });
  // The API copies the previous session's given homework into the new draft for review
  const draft = fake.session({
    id: 77,
    sessionNumber: 2,
    status: "draft",
    reviewHomework: [{ description: "Entspannungsübungen täglich", status: "open" }],
  });
  mock.use(api.patients.find.handler(() => patient));
  mock.use(api.sessions.filter.handler(() => resultPage([])));
  mock.use(api.sessions.findOpenSession.handler(() => null));
  mock.use(api.sessions.createDraft.handler(() => draft));
  mock.use(api.sessions.find.handler(() => draft));
  mock.use(api.treatmentPlans.findByPatientId.handler(() => null));
  mock.use(api.sessions.findPreviousSession.handler(() => null));

  await page.goto(`/administration/patients/${patient.id}/sessions`);
  await page.getByRole("button", { name: "Sitzung starten" }).click();
  await expect(page).toHaveURL(`/administration/patients/${patient.id}/sessions/${draft.id}`, { timeout: 5000 });

  await expect(page.getByText("Hausaufgaben — Rückschau")).toBeVisible();
  await expect(page.getByText("Entspannungsübungen täglich")).toBeVisible();
});

test("updates homework review status via toggle and it autosaves", async ({ page, mock }) => {
  const session = fake.session({
    sessionNumber: 2,
    status: "draft",
    reviewHomework: [{ description: "Tagebuch führen", status: "open" }],
  });
  mock.use(api.sessions.find.handler(() => session));
  mock.use(api.treatmentPlans.findByPatientId.handler(() => null));
  mock.use(api.sessions.findPreviousSession.handler(() => null));
  const update: Record<string, unknown>[] = [];
  mock.use(
    api.sessions.update.handler(({ input }) => {
      update.push(input);
      return { ...session, ...input } as Session;
    }),
  );

  await page.goto(`/administration/patients/${session.patient.id}/sessions/${session.id}`);
  await expect(page.getByText("Hausaufgaben — Rückschau")).toBeVisible();
  await page.getByRole("button", { name: "Erledigt", exact: true }).click();

  await expect(page.getByText("Entwurf gespeichert")).toBeVisible({ timeout: 5000 });
  const calls = update;
  expect(calls.at(-1)?.reviewHomework).toEqual([{ description: "Tagebuch führen", status: "done" }]);
});
