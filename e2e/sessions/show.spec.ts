import { sessionFactory } from "../factories";
import { test, expect } from "../fixtures";

test("shows a session with pre-filled values", async ({ page }) => {
  const session = await sessionFactory.create({
    sessionNumber: 3,
    clinicalNotes: "Therapeutische Notiz",
    status: "draft",
  });

  await page.goto(
    `/administration/patients/${session.patientId}/sessions/${session.id}`
  );

  await expect(page.getByText(/Sitzung 3/)).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Notizen (verschlüsselt)" })
  ).toHaveValue("Therapeutische Notiz");
});

test("disables finalize for a final session", async ({ page }) => {
  const session = await sessionFactory.create({ status: "final" });

  await page.goto(
    `/administration/patients/${session.patientId}/sessions/${session.id}`
  );

  await expect(page.getByRole("button", { name: "Abschließen" })).toBeDisabled();
});
