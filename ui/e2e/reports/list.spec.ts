import { test, expect } from "../fixtures";
import { page as resultPage, patientFactory, sessionFactory } from "../support/factories";

test("asks the API for finalized sessions only and lists them", async ({ page, mockApi }) => {
  const patient = patientFactory.build();
  await mockApi.patients.find.returns(patient);
  const filter = await mockApi.sessions.filter.returns(
    resultPage([sessionFactory.build({ status: "final", sessionNumber: 2 })]),
  );

  await page.goto(`/administration/patients/${patient.id}/reports`);

  // Header row plus the single finalized session row
  await expect(page.getByRole("row")).toHaveCount(2);
  await expect(page.getByRole("gridcell", { name: "2", exact: true })).toBeVisible();
  const [query] = await filter.calls();
  expect(query).toMatchObject({ patientId: String(patient.id), status: "final" });
});

test("enables report generation after selecting all sessions via the header checkbox", async ({ page, mockApi }) => {
  const patient = patientFactory.build();
  await mockApi.patients.find.returns(patient);
  await mockApi.sessions.filter.returns(resultPage(sessionFactory.buildList(2, { status: "final" })));

  await page.goto(`/administration/patients/${patient.id}/reports`);
  await page.getByRole("checkbox", { name: "Select all rows" }).click();

  await expect(page.getByRole("button", { name: "Bericht generieren" })).toBeEnabled();
});
