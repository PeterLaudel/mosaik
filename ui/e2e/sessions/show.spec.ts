import type { Session } from "@peterlaudel/mosaik-contract";
import type { MockApi } from "../support/mockApi";
import { test, expect } from "../fixtures";
import { fake } from "../support/factories";

async function sessionPage(mockApi: MockApi, overrides: Partial<Session>) {
  const session = fake.session(overrides);
  await mockApi.sessions.find.returns(session);
  await mockApi.treatmentPlans.findByPatientId.returns(null);
  await mockApi.sessions.findPreviousSession.returns(null);
  await mockApi.sessions.update.returns(({ id, ...data }) => ({ ...session, ...data, id: id ?? session.id }) as Session);
  return `/administration/patients/${session.patient.id}/sessions/${session.id}`;
}

test("shows a session with pre-filled values", async ({ page, mockApi }) => {
  const url = await sessionPage(mockApi, { sessionNumber: 3, clinicalNotes: "Therapeutische Notiz", status: "draft" });

  await page.goto(url);

  await expect(page.getByText(/Sitzung 3/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Notizen (verschlüsselt)" })).toHaveValue("Therapeutische Notiz");
});

test("disables finalize for a final session", async ({ page, mockApi }) => {
  const url = await sessionPage(mockApi, { status: "final" });

  await page.goto(url);

  await expect(page.getByRole("button", { name: "Abschließen" })).toBeDisabled();
});
