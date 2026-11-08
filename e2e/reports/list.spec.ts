import { sessionFactory, patientFactory } from "../factories";
import { test, expect } from "../fixtures";

test("only lists finalized sessions as report candidates", async ({ page }) => {
  const patient = await patientFactory.create();
  await sessionFactory.create({ patientId: patient.id, status: "final", sessionNumber: 2 });
  await sessionFactory.create({ patientId: patient.id, status: "draft", sessionNumber: 3 });

  await page.goto(`/administration/patients/${patient.id}/reports`);

  // Header row plus the single finalized session row — the draft session is excluded
  await expect(page.getByRole("row")).toHaveCount(2);
  await expect(page.getByRole("gridcell", { name: "2", exact: true })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "3", exact: true })).not.toBeVisible();
});

test("enables report generation after selecting all sessions via the header checkbox", async ({ page }) => {
  const patient = await patientFactory.create();
  await sessionFactory.createList(2, { patientId: patient.id, status: "final" });

  await page.goto(`/administration/patients/${patient.id}/reports`);
  await page.getByRole("checkbox", { name: "Select all rows" }).click();

  await expect(page.getByRole("button", { name: "Bericht generieren" })).toBeEnabled();
});
