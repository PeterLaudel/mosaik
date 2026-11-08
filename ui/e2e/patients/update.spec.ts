import { test, expect } from "../fixtures";
import { api } from "../support/mockApi";
import { fake, page as resultPage } from "../support/factories";

test("updates patient", async ({ page, mock }) => {
  const patient = fake.patient({ name: "Maximilian", surname: "Thorsten" });
  mock.use(api.patients.filter.handler(() => resultPage([patient])));
  mock.use(api.patients.find.handler(() => patient));
  const update: Record<string, unknown>[] = [];
  mock.use(
    api.patients.update.handler(({ input }) => {
      update.push(input);
      return { ...patient, ...input };
    }),
  );

  await page.goto("/administration/patients");
  await page.getByText(patient.surname, { exact: true }).click();
  await expect(page.getByText("Patientendaten")).toBeVisible();

  await page.getByRole("textbox", { name: "Vorname" }).first().fill("Max");
  mock.use(api.patients.filter.handler(() => resultPage([{ ...patient, name: "Max" }])));
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByRole("gridcell", { name: "Max", exact: true })).toBeVisible();
  const [body] = update;
  expect(body).toMatchObject({ id: patient.id, name: "Max", surname: "Thorsten" });
});
