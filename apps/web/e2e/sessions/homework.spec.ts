import { patientFactory } from "@api/factories/patient";
import { sessionFactory } from "@api/factories/session";
import { givenHomeworkFactory, reviewHomeworkFactory } from "@api/factories/homework";
import { test, expect } from "../fixtures";

test("assigns homework in a session and it appears for review in the next session", async ({ page }) => {
  const patient = await patientFactory.create({ name: "Maria", surname: "Schmidt" });
  const session1 = await sessionFactory.create({ patientId: patient.id, sessionNumber: 1, status: "final" });
  await givenHomeworkFactory.create({ sessionId: session1.id, description: "Entspannungsübungen täglich" });

  await page.goto(`/administration/patients/${patient.id}/sessions`);
  await page.getByRole("button", { name: "Sitzung starten" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/administration/patients/${patient.id}/sessions/\\d+`),
    { timeout: 5000 }
  );

  await expect(page.getByText("Hausaufgaben — Rückschau")).toBeVisible();
  await expect(page.getByText("Entspannungsübungen täglich")).toBeVisible();
});

test("updates homework review status via toggle and it autosaves", async ({ page }) => {
  const patient = await patientFactory.create({ name: "Klaus", surname: "Bauer" });
  await sessionFactory.create({ patientId: patient.id, sessionNumber: 1, status: "final" });
  const session2 = await sessionFactory.create({ patientId: patient.id, sessionNumber: 2, status: "draft" });
  await reviewHomeworkFactory.create({ sessionId: session2.id, description: "Tagebuch führen" });

  await page.goto(`/administration/patients/${patient.id}/sessions/${session2.id}`);

  await expect(page.getByText("Hausaufgaben — Rückschau")).toBeVisible();
  await page.getByRole("button", { name: "Erledigt", exact: true }).click();

  await expect(page.getByText("Entwurf gespeichert")).toBeVisible({ timeout: 5000 });
});
