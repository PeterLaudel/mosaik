import { test, expect } from "../fixtures";
import { api } from "../support/mockApi";
import { fake, page as resultPage } from "../support/factories";

test("lists sessions for a patient", async ({ page, mock }) => {
  const patient = fake.patient();
  mock.use(api.patients.find.handler(() => patient));
  mock.use(api.sessions.findOpenSession.handler(() => null));
  const filter: Record<string, unknown>[] = [];
  mock.use(
    api.sessions.filter.handler(({ input }) => {
      filter.push(input);
      return resultPage(Array.from({ length: 2 }, () => fake.session({ status: "draft" })));
    }),
  );

  await page.goto(`/administration/patients/${patient.id}/sessions`);

  // Two data rows plus the header row
  await expect(page.getByRole("row")).toHaveCount(3);
  await expect(page.getByText("Entwurf").first()).toBeVisible();
  const [query] = filter;
  expect(query).toMatchObject({ patientId: patient.id });
});
