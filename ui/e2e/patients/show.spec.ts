import { test, expect } from "../fixtures";
import { fake, page as resultPage } from "../support/factories";

test("filter patients", async ({ page, mock }) => {
  const jane = fake.patient({ name: "Jane", surname: "Doe" });
  const john = fake.patient({ name: "John", surname: "Doe" });
  mock.patients.filter(resultPage([jane, john]));

  await page.goto("/administration/patients");

  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).toBeVisible();

  const filter: Record<string, unknown>[] = [];
  mock.patients.filter(({ input }) => {
    filter.push(input);
    return resultPage([jane]);
  });
  await page.getByRole("textbox", { name: "Suche" }).fill("Jane");

  await expect(page.getByText("John")).not.toBeVisible();
  await expect(page.getByText("Jane")).toBeVisible();
  const calls = filter;
  expect(calls.at(-1)).toMatchObject({ search: "Jane" });
});
