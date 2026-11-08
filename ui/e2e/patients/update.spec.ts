import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

test("updates patient", async ({ page, mock }) => {
  const patient = fake.patient({ name: "Maximilian", surname: "Thorsten" });
  mock.patients.filter(resultPage([patient]));
  mock.patients.find(patient);
  const update: Record<string, unknown>[] = [];
  mock.patients.update(({ input }) => {
    update.push(input);
    return { ...patient, ...input };
  });

  await page.goto("/administration/patients");
  await page.getByText(patient.surname, { exact: true }).click();
  await expect(page.getByText("Patientendaten")).toBeVisible();

  await page.getByRole("textbox", { name: "Vorname" }).first().fill("Max");
  mock.patients.filter(resultPage([{ ...patient, name: "Max" }]));
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByRole("gridcell", { name: "Max", exact: true })).toBeVisible();
  const [body] = update;
  expect(body).toMatchObject({ id: patient.id, name: "Max", surname: "Thorsten" });
});
