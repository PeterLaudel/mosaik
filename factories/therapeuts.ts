import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";

type TherapeutRow = Database["therapeuts"];
type TherapeutBuild = Omit<Insertable<TherapeutRow>, "id">;
type TherapeutCreated = Selectable<TherapeutRow>;

export const therapeutFactory = Factory.define<TherapeutBuild, unknown, TherapeutCreated>(() => ({
  title: faker.person.prefix(),
  name: faker.person.firstName(),
  surname: faker.person.lastName(),
  street: faker.location.streetAddress(),
  zip: faker.location.zipCode(),
  city: faker.location.city(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  taxId: faker.string.alphanumeric(10).toUpperCase(),
  bankName: faker.company.name(),
  iban: faker.finance.iban(),
  bic: faker.finance.bic(),
  website: faker.internet.url(),
  enr: faker.string.numeric(10),
})).onCreate(async (attrs) => {
  const db = getDb();
  return db.insertInto("therapeuts").values(attrs).returningAll().executeTakeFirstOrThrow();
});
