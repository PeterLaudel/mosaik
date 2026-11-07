import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import Address from "@mosaik/contract/models/address";

export const addressFactory: Factory<Address> = Factory.define<Address>(() => ({
  street: faker.location.streetAddress(),
  city: faker.location.city(),
  zip: faker.location.zipCode('#####'),
}));
