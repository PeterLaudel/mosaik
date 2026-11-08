import type { PseudonymizationCheckResult } from "@peterlaudel/mosaik-contract";
import type { Mock } from "../fixtures";
import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

function reportFor(mock: Mock, result: PseudonymizationCheckResult) {
  const patient = fake.patient();
  const session = fake.session({ status: "final" });
  mock.patients.find(patient);
  mock.sessions.filter(resultPage([session]));
  const check: Record<string, unknown>[] = [];
  mock.sessions.getPseudonymizedText(({ input }) => {
    check.push(input);
    return result;
  });
  return { url: `/administration/patients/${patient.id}/reports`, session, check };
}

test("shows the pseudonymized text and confirms once pseudonymization is done", async ({ page, mock }) => {
  const { url, session, check } = reportFor(mock, {
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
  const [body] = check;
  expect(body).toMatchObject({ sessionIds: [session.id] });
});

test("disables confirmation while pseudonymization is still pending", async ({ page, mock }) => {
  const { url } = reportFor(mock, { status: "pending" });

  await page.goto(url);
  await page.getByRole("checkbox", { name: "Select row" }).click();
  await page.getByRole("button", { name: "Bericht generieren" }).click();

  await expect(page.getByText("Pseudonymisierung läuft")).toBeVisible();
  await expect(page.getByRole("button", { name: "Bestätigen & Bericht erstellen" })).toBeDisabled();
});

test("shows a warning and disables confirmation when pseudonymization failed", async ({ page, mock }) => {
  const { url } = reportFor(mock, { status: "failed" });

  await page.goto(url);
  await page.getByRole("checkbox", { name: "Select row" }).click();
  await page.getByRole("button", { name: "Bericht generieren" }).click();

  await expect(page.getByText("Pseudonymisierung fehlgeschlagen")).toBeVisible();
  await expect(page.getByRole("button", { name: "Bestätigen & Bericht erstellen" })).toBeDisabled();
});
