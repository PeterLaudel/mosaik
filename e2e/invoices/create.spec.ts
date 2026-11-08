import { therapeutFactory, serviceFactory, serviceAmountFactory, patientFactory } from "../factories";
import { test, expect } from "../fixtures";

test("createas an invoice", async ({ page }) => {
  await therapeutFactory.create({});
  const patient = await patientFactory.create({
    name: "Max",
    surname: "Mustermann",
  });
  const service = await serviceFactory.create({
    short: "Super short",
  });
  await serviceAmountFactory.create({ serviceId: service.id, factor: "1.0", price: 10 });
  await serviceAmountFactory.create({ serviceId: service.id, factor: "2.3", price: 23 });

  await page.goto("/administration/invoices");

  await page.getByRole("button", { name: "Rechnung anlegen" }).click();

  const heading = page.getByRole("heading", { name: "Rechnung erstellen" });
  await expect(heading).toBeVisible();

  await page.getByRole("combobox", { name: "Patient" }).first().click();
  await page.getByRole("option", { name: patient.name }).click();

  const dateGroup = page.getByRole("group", { name: "Leistungs Datum" });
  await dateGroup.getByRole("spinbutton", { name: "Tag" }).fill("10");
  await dateGroup.getByRole("spinbutton", { name: "Monat" }).fill("10");
  await dateGroup.getByRole("spinbutton", { name: "Jahr" }).fill("2024");

  await page.getByRole("combobox", { name: "Leistung" }).click();
  await page.getByRole("option", { name: service.short }).click();

  await page.waitForTimeout(1000);

  await page.getByRole("button", { name: "Anlegen" }).click();

  const succesAlert = page.getByRole("alert");
  await expect(
    succesAlert.getByText("Rechnung wurde gespeichert")
  ).toBeVisible();
});
