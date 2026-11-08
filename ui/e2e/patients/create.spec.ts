import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

test("creates a patient", async ({ page, mockApi }) => {
  await mockApi.patients.filter.returns(resultPage([]));
  const create = await mockApi.patients.create.returns((input) => fake.patient(input));

  await page.goto("/administration/patients");
  await page.getByRole("button", { name: "Patienten anlegen" }).click();
  await expect(page.getByText("Patienten anlegen")).toBeVisible();

  await page.getByRole("textbox", { name: "Vorname" }).first().fill("Max");
  await page.getByRole("textbox", { name: "Nachname" }).first().fill("Mustermann");
  await page.getByRole("textbox", { name: "E-Mail" }).first().fill("max.mustermann@example.com");
  const birthdate = page.getByRole("group", { name: "Geburtsdatum" });
  await birthdate.getByRole("spinbutton", { name: "Tag" }).fill("05");
  await birthdate.getByRole("spinbutton", { name: "Monat" }).fill("05");
  await birthdate.getByRole("spinbutton", { name: "Jahr" }).fill("1989");
  await page.getByRole("textbox", { name: "Straße" }).first().fill("Musterstraße 1");
  await page.getByRole("textbox", { name: "PLZ" }).first().fill("12345");
  await page.getByRole("textbox", { name: "Stadt" }).first().fill("Musterstadt");

  const created = fake.patient({ name: "Max", surname: "Mustermann" });
  await mockApi.patients.filter.returns(resultPage([created]));
  await page.getByRole("button", { name: "Anlegen" }).click();

  await expect(page.getByText("Patient wurde angelegt")).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "Max", exact: true })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "Mustermann", exact: true })).toBeVisible();
  const [body] = await create.calls();
  expect(body).toMatchObject({
    name: "Max",
    surname: "Mustermann",
    email: "max.mustermann@example.com",
    birthdate: "1989-05-05",
    address: { street: "Musterstraße 1", zip: "12345", city: "Musterstadt" },
  });
});
