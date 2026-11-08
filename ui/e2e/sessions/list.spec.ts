import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

test("lists sessions for a patient", async ({ page, mockApi }) => {
  const patient = fake.patient();
  await mockApi.patients.find.returns(patient);
  await mockApi.sessions.findOpenSession.returns(null);
  const filter = await mockApi.sessions.filter.returns(resultPage(Array.from({ length: 2 }, () => fake.session({ status: "draft" }))));

  await page.goto(`/administration/patients/${patient.id}/sessions`);

  // Two data rows plus the header row
  await expect(page.getByRole("row")).toHaveCount(3);
  await expect(page.getByText("Entwurf").first()).toBeVisible();
  const [query] = await filter.calls();
  expect(query).toMatchObject({ patientId: patient.id });
});
