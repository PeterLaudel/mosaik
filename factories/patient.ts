import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { addressFactory } from "./address";
import { billingInfoFactory } from "./billingInfo";
import { getDb } from "@/initialize";
import { Patient } from "@/features/patients/model";

export const patientFactory = Factory.define<
  Omit<Patient, "id">,
  unknown,
  Patient
>(() => ({
  name: faker.person.firstName(),
  surname: faker.person.lastName(),
  email: faker.internet.email(),
  birthdate: faker.date.birthdate().toISOString().split("T")[0],
  address: addressFactory.build(),
  billingInfo: billingInfoFactory.build(),
  diagnosis: null,
  invoicePassword: faker.internet.password(),
})).onCreate(async (patient) => {
  const { address, billingInfo, ...rest } = patient;
  const {
    id,
    name,
    surname,
    email,
    birthdate,
    street,
    city,
    zip,
    invoicePassword,
    diagnosis,
    billingName,
    billingSurname,
    billingEmail,
    billingStreet,
    billingCity,
    billingZip,
  } = await getDb()
    .insertInto("patients")
    .values({
      ...rest,
      ...address,
      billingName: billingInfo.name,
      billingSurname: billingInfo.surname,
      billingEmail: billingInfo.email,
      billingStreet: billingInfo.address.street,
      billingCity: billingInfo.address.city,
      billingZip: billingInfo.address.zip,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return {
    id,
    name,
    surname,
    email,
    birthdate,
    diagnosis,
    invoicePassword,
    address: {
      street,
      city,
      zip,
    },
    billingInfo: {
      name: billingName,
      surname: billingSurname,
      email: billingEmail,
      address: {
        street: billingStreet,
        city: billingCity,
        zip: billingZip,
      },
    },
  };
});
