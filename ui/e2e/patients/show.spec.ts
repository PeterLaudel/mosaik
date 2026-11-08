import { test, expect } from "../fixtures";
import { page as resultPage, patientFactory } from "../support/factories";

test("filter patients", async ({ page, mockApi }) => {
  const jane = patientFactory.build({ name: "Jane", surname: "Doe" });
  const john = patientFactory.build({ name: "John", surname: "Doe" });
  await mockApi.patients.filter.returns(resultPage([jane, john]));

  await page.goto("/administration/patients");

  await expect(page.getByText("Jane")).toBeVisible();
  await expect(page.getByText("John")).toBeVisible();

  const filter = await mockApi.patients.filter.returns(resultPage([jane]));
  await page.getByRole("textbox", { name: "Suche" }).fill("Jane");

  await expect(page.getByText("John")).not.toBeVisible();
  await expect(page.getByText("Jane")).toBeVisible();
  const calls = await filter.calls();
  expect(calls.at(-1)).toMatchObject({ search: "Jane" });
});
