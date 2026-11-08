import type { PseudonymizationCheckResult } from "@peterlaudel/mosaik-contract";
import type { MockApi } from "../support/mockApi";
import { test, expect } from "../fixtures";
import { page as resultPage, patientFactory, sessionFactory } from "../support/factories";

async function reportFor(mockApi: MockApi, result: PseudonymizationCheckResult) {
  const patient = patientFactory.build();
  const session = sessionFactory.build({ status: "final" });
  await mockApi.patients.find.returns(patient);
  await mockApi.sessions.filter.returns(resultPage([session]));
  const check = await mockApi.sessions.getPseudonymizedText.returns(result);
  return { url: `/administration/patients/${patient.id}/reports`, session, check };
}

test("shows the pseudonymized text and confirms once pseudonymization is done", async ({ page, mockApi }) => {
  const { url, session, check } = await reportFor(mockApi, {
    status: "ready",
    text: "Pseudonymisierte Notiz\n\nPseudonymisierter Plan",
  });

  await page.goto(url);
  await page.getByRole("checkbox", { name: "Select row" }).click();
  await page.getByRole("button", { name: "Bericht generieren" }).click();

  await expect(page.getByText("Datenschutz-Prüfung")).toBeVisible();
  const textarea = page.getByRole("textbox", { name: "Pseudonymisierter Text" });
  await expect(textarea).toHaveValue(/Pseudonymisierte Notiz/);
  await expect(textarea).toHaveValue(/Pseudonymisierter Plan/);
  await page.getByRole("button", { name: "Bestätigen & Bericht erstellen" }).click();
  await expect(page.getByText("Datenschutz-Prüfung bestätigt")).toBeVisible();
  const [body] = await check.calls();
  expect(body).toMatchObject({ sessionIds: [session.id] });
});

test("disables confirmation while pseudonymization is still pending", async ({ page, mockApi }) => {
  const { url } = await reportFor(mockApi, { status: "pending" });

  await page.goto(url);
  await page.getByRole("checkbox", { name: "Select row" }).click();
  await page.getByRole("button", { name: "Bericht generieren" }).click();

  await expect(page.getByText("Pseudonymisierung läuft")).toBeVisible();
  await expect(page.getByRole("button", { name: "Bestätigen & Bericht erstellen" })).toBeDisabled();
});

test("shows a warning and disables confirmation when pseudonymization failed", async ({ page, mockApi }) => {
  const { url } = await reportFor(mockApi, { status: "failed" });

  await page.goto(url);
  await page.getByRole("checkbox", { name: "Select row" }).click();
  await page.getByRole("button", { name: "Bericht generieren" }).click();

  await expect(page.getByText("Pseudonymisierung fehlgeschlagen")).toBeVisible();
  await expect(page.getByRole("button", { name: "Bestätigen & Bericht erstellen" })).toBeDisabled();
});
