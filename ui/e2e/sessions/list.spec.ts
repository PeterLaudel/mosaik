import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

test("lists sessions for a patient", async ({ page, mock }) => {
  const patient = fake.patient();
  mock.patients.find(patient);
  mock.sessions.findOpenSession(null);
  const filter: Record<string, unknown>[] = [];
  mock.sessions.filter(({ input }) => {
    filter.push(input);
    return resultPage(Array.from({ length: 2 }, () => fake.session({ status: "draft" })));
  });

  await page.goto(`/administration/patients/${patient.id}/sessions`);

  // Two data rows plus the header row
  await expect(page.getByRole("row")).toHaveCount(3);
  await expect(page.getByText("Entwurf").first()).toBeVisible();
  const [query] = filter;
  expect(query).toMatchObject({ patientId: patient.id });
});
