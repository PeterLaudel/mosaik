import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

test("updates patient", async ({ page, mockApi }) => {
  const patient = fake.patient({ name: "Maximilian", surname: "Thorsten" });
  await mockApi.patients.filter.returns(resultPage([patient]));
  await mockApi.patients.find.returns(patient);
  const update = await mockApi.patients.update.returns((input) => ({ ...patient, ...input }));

  await page.goto("/administration/patients");
  await page.getByText(patient.surname, { exact: true }).click();
  await expect(page.getByText("Patientendaten")).toBeVisible();

  await page.getByRole("textbox", { name: "Vorname" }).first().fill("Max");
  await mockApi.patients.filter.returns(resultPage([{ ...patient, name: "Max" }]));
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByRole("gridcell", { name: "Max", exact: true })).toBeVisible();
  const [body] = await update.calls();
  expect(body).toMatchObject({ id: patient.id, name: "Max", surname: "Thorsten" });
});
