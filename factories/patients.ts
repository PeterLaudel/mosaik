import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";

type PatientRow = Database["patients"];
type PatientBuild = Omit<Insertable<PatientRow>, "id">;
type PatientCreated = Selectable<PatientRow>;

export const patientFactory = Factory.define<PatientBuild, unknown, PatientCreated>(() => ({
  name: faker.person.firstName(),
  surname: faker.person.lastName(),
  email: faker.internet.email(),
  birthdate: faker.date.birthdate().toISOString().split("T")[0],
  street: faker.location.streetAddress(),
  city: faker.location.city(),
  zip: faker.location.zipCode("#####"),
  diagnosis: null,
  billingName: faker.person.firstName(),
  billingSurname: faker.person.lastName(),
  billingEmail: faker.internet.email(),
  billingStreet: faker.location.streetAddress(),
  billingCity: faker.location.city(),
  billingZip: faker.location.zipCode("#####"),
  invoicePassword: faker.internet.password(),
})).onCreate(async (attrs) => {
  const db = getDb();
  return db.insertInto("patients").values(attrs).returningAll().executeTakeFirstOrThrow();
});
