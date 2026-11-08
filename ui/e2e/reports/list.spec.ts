import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

test("asks the API for finalized sessions only and lists them", async ({ page, mock }) => {
  const patient = fake.patient();
  mock.patients.find(patient);
  const filter: Record<string, unknown>[] = [];
  mock.sessions.filter(({ input }) => {
    filter.push(input);
    return resultPage([fake.session({ status: "final", sessionNumber: 2 })]);
  });

  await page.goto(`/administration/patients/${patient.id}/reports`);

  // Header row plus the single finalized session row
  await expect(page.getByRole("row")).toHaveCount(2);
  await expect(page.getByRole("gridcell", { name: "2", exact: true })).toBeVisible();
  const [query] = filter;
  expect(query).toMatchObject({ patientId: patient.id, status: "final" });
});

test("enables report generation after selecting all sessions via the header checkbox", async ({ page, mock }) => {
  const patient = fake.patient();
  mock.patients.find(patient);
  mock.sessions.filter(resultPage(Array.from({ length: 2 }, () => fake.session({ status: "final" }))));

  await page.goto(`/administration/patients/${patient.id}/reports`);
  await page.getByRole("checkbox", { name: "Select all rows" }).click();

  await expect(page.getByRole("button", { name: "Bericht generieren" })).toBeEnabled();
});
