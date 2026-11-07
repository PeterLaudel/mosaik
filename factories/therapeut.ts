import { Factory } from "fishery";
import { getDb } from "@/initialize";
import type { Therapeut } from "@/features/therapeuts/model";
import { faker } from "@faker-js/faker";

export const therapeutFactory = Factory.define<
  Omit<Therapeut, "id">,
  unknown,
  Therapeut
>(() => ({
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
})).onCreate(async (therapeut) => {
  const createdTherapeut = await getDb()
    .insertInto("therapeuts")
    .values(therapeut)
    .returningAll()
    .executeTakeFirstOrThrow();

  return createdTherapeut;
});
