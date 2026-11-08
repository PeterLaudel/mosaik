import { test, expect } from "../fixtures";
import { page as resultPage, patientFactory, sessionFactory } from "../support/factories";

test("lists sessions for a patient", async ({ page, mockApi }) => {
  const patient = patientFactory.build();
  await mockApi.patients.find.returns(patient);
  await mockApi.sessions.findOpenSession.returns(null);
  const filter = await mockApi.sessions.filter.returns(resultPage(sessionFactory.buildList(2, { status: "draft" })));

  await page.goto(`/administration/patients/${patient.id}/sessions`);

  // Two data rows plus the header row
  await expect(page.getByRole("row")).toHaveCount(3);
  await expect(page.getByText("Entwurf").first()).toBeVisible();
  const [query] = await filter.calls();
  expect(query).toMatchObject({ patientId: String(patient.id) });
});
