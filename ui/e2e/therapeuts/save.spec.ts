import { test, expect } from "../fixtures";
import { api } from "../support/mockApi";
import { fake } from "../support/factories";

test("saves a therapeut with empty form", async ({ page, mock }) => {
  mock.use(api.therapeuts.all.handler(() => []));
  const create: Record<string, unknown>[] = [];
  mock.use(
    api.therapeuts.create.handler(({ input }) => {
      create.push(input);
      return fake.therapeut(input);
    }),
  );

  await page.goto("/administration/therapeuts");
  await expect(page.getByRole("heading", { name: "Therapeut" })).toBeVisible();

  await page.getByLabel("Titel").fill("Dr.");
  await page.getByLabel("Name", { exact: true }).fill("New Name");
  await page.getByLabel("Vorname").fill("New Vorname");
  await page.getByLabel("Straße").fill("New Strasse");
  await page.getByLabel("PLZ").fill("12345");
  await page.getByLabel("Ort").fill("New Ort");
  await page.getByLabel("Telefon").fill("123456789");
  await page.getByLabel("E-Mail").fill("test@test.de");
  await page.getByLabel("Steuer-ID").fill("123456789");
  await page.getByLabel("Bankname").fill("New Bank");
  await page.getByLabel("IBAN").fill("DE89370400440532013000");
  await page.getByLabel("BIC").fill("COBADEFFXXX");
  await page.getByLabel("Webseite").fill("https://example.com");
  await page.getByLabel("ENR").fill("123456789");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Therapeut gespeichert")).toBeVisible();
  const [body] = create;
  expect(body).toMatchObject({
    title: "Dr.",
    name: "New Vorname",
    surname: "New Name",
    zip: "12345",
    iban: "DE89370400440532013000",
  });
});

test("updates a therapeut with filled form", async ({ page, mock }) => {
  const therapeut = fake.therapeut();
  mock.use(api.therapeuts.all.handler(() => [therapeut]));
  const update: Record<string, unknown>[] = [];
  mock.use(
    api.therapeuts.update.handler(({ input }) => {
      update.push(input);
      return { ...therapeut, ...input };
    }),
  );

  await page.goto("/administration/therapeuts");
  await expect(page.getByRole("heading", { name: "Therapeut" })).toBeVisible();

  await expect(page.getByLabel("Titel")).toHaveValue(therapeut.title);
  await expect(page.getByLabel("Vorname")).toHaveValue(therapeut.name);
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(therapeut.surname);
  await expect(page.getByLabel("Straße")).toHaveValue(therapeut.street);
  await expect(page.getByLabel("PLZ")).toHaveValue(therapeut.zip);
  await expect(page.getByLabel("Ort")).toHaveValue(therapeut.city);
  await expect(page.getByLabel("Telefon")).toHaveValue(therapeut.phone);
  await expect(page.getByLabel("E-Mail")).toHaveValue(therapeut.email);
  await expect(page.getByLabel("Steuer-ID")).toHaveValue(therapeut.taxId);
  await expect(page.getByLabel("Bankname")).toHaveValue(therapeut.bankName);
  await expect(page.getByLabel("IBAN")).toHaveValue(therapeut.iban);
  await expect(page.getByLabel("BIC")).toHaveValue(therapeut.bic);
  await expect(page.getByLabel("Webseite")).toHaveValue(therapeut.website);
  await expect(page.getByLabel("ENR")).toHaveValue(therapeut.enr);

  await page.getByLabel("Name", { exact: true }).fill("new name");
  await page.getByLabel("Vorname").fill("new vorname");
  await page.getByLabel("PLZ").fill("54321");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Therapeut gespeichert")).toBeVisible();
  const [body] = update;
  expect(body).toMatchObject({ id: therapeut.id, surname: "new name", name: "new vorname", zip: "54321" });
});

test("shows validation errors on invalid form", async ({ page, mock }) => {
  mock.use(api.therapeuts.all.handler(() => []));
  const create: Record<string, unknown>[] = [];
  mock.use(
    api.therapeuts.create.handler(({ input }) => {
      create.push(input);
      return fake.therapeut(input);
    }),
  );

  await page.goto("/administration/therapeuts");
  await expect(page.getByRole("heading", { name: "Therapeut" })).toBeVisible();

  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Titel ist erforderlich")).toBeVisible();
  await expect(page.getByText("Name ist erforderlich", { exact: true })).toBeVisible();
  await expect(page.getByText("Vorname ist erforderlich")).toBeVisible();
  await expect(page.getByText("Straße ist erforderlich")).toBeVisible();
  await expect(page.getByText("PLZ ist erforderlich")).toBeVisible();
  await expect(page.getByText("Ort ist erforderlich")).toBeVisible();
  await expect(page.getByText("Telefon ist erforderlich")).toBeVisible();
  await expect(page.getByText("E-Mail ist ungültig")).toBeVisible();
  await expect(page.getByText("Steuer-ID ist erforderlich")).toBeVisible();
  await expect(page.getByText("Bankname ist erforderlich")).toBeVisible();
  await expect(page.getByText("IBAN ist erforderlich")).toBeVisible();
  await expect(page.getByText("BIC ist erforderlich")).toBeVisible();
  await expect(page.getByText("Webseite ist ungültig")).toBeVisible();
  await expect(page.getByText("ENR ist erforderlich")).toBeVisible();
  expect(create).toHaveLength(0);
});
