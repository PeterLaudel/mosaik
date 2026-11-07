import { patientFactory } from "@api/factories/patient";
import { sessionFactory } from "@api/factories/session";
import { test, expect } from "../fixtures";

test("lists sessions for a patient", async ({ page }) => {
  const patient = await patientFactory.create();
  await sessionFactory.createList(2, { patientId: patient.id });

  await page.goto(`/administration/patients/${patient.id}/sessions`);

  // Two data rows plus the header row
  await expect(page.getByRole("row")).toHaveCount(3);
  await expect(page.getByText("Entwurf").first()).toBeVisible();
});
