import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import type { Address } from "@/features/patients/model";

export const addressFactory: Factory<Address> = Factory.define<Address>(() => ({
  street: faker.location.streetAddress(),
  city: faker.location.city(),
  zip: faker.location.zipCode('#####'),
}));
