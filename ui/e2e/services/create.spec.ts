import { test, expect } from "../fixtures";
import { api } from "../support/mockApi";
import { fake, page as resultPage } from "../support/factories";

test("creates a service", async ({ page, mock }) => {
  mock.use(api.services.filter.handler(() => resultPage([])));
  const create: Record<string, unknown>[] = [];
  mock.use(
    api.services.create.handler(({ input }) => {
      create.push(input);
      return fake.service(input);
    }),
  );

  await page.goto("/administration/services");
  await page.getByRole("button", { name: "Leistung anlegen" }).click();
  await expect(page.getByRole("heading", { name: "Leistung anlegen" })).toBeVisible();

  await page.getByLabel("Kürzel").fill("GOP-1");
  await page.getByLabel("GOP-Nr").fill("1234");
  await page.getByLabel("Beschreibung").fill("Test Beschreibung");
  await page.getByLabel("Punkte").fill("200");

  mock.use(api.services.filter.handler(() => resultPage([fake.service({ short: "GOP-1" })])));
  await page.getByRole("button", { name: "Anlegen" }).click();

  await expect(page.getByText("Leistung gespeichert")).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "GOP-1" })).toBeVisible();
  const [body] = create;
  expect(body).toMatchObject({
    short: "GOP-1",
    originalGopNr: "1234",
    description: "Test Beschreibung",
    points: 200,
  });
});
