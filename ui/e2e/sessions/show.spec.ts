import type { Session } from "@peterlaudel/mosaik-contract";
import type { Mock } from "../fixtures";
import { test, expect } from "../fixtures";
import { fake } from "../support/factories";

function sessionPage(mock: Mock, overrides: Partial<Session>) {
  const session = fake.session(overrides);
  mock.sessions.find(session);
  mock.treatmentPlans.findByPatientId(null);
  mock.sessions.findPreviousSession(null);
  mock.sessions.update(({ input }) => ({ ...session, ...input }) as Session);
  return `/administration/patients/${session.patient.id}/sessions/${session.id}`;
}

test("shows a session with pre-filled values", async ({ page, mock }) => {
  const url = sessionPage(mock, { sessionNumber: 3, clinicalNotes: "Therapeutische Notiz", status: "draft" });

  await page.goto(url);

  await expect(page.getByText(/Sitzung 3/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Notizen (verschlüsselt)" })).toHaveValue("Therapeutische Notiz");
});

test("disables finalize for a final session", async ({ page, mock }) => {
  const url = sessionPage(mock, { status: "final" });

  await page.goto(url);

  await expect(page.getByRole("button", { name: "Abschließen" })).toBeDisabled();
});
