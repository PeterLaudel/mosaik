import type { InvoicePositionsTable } from "../src/db";
import { getDb } from "../src/initialize";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const invoicePositionFactory = Factory.define<
  Omit<InvoicePositionsTable, "id">,
  unknown,
  Omit<InvoicePositionsTable, "id"> & { id: number }
>(({ sequence }) => ({
  serviceDate: faker.date.birthdate().toISOString().split("T")[0],
  serviceId: sequence,
  invoiceId: sequence,
  amount: faker.number.int({ min: 1, max: 5 }),
  factor: faker.helpers.arrayElement(["1.0", "1.8", "2.3"]),
  price: faker.number.float({ min: 100, max: 200 }),
})).onCreate(async (invoicePosition) => {
  return await getDb()
    .insertInto("invoicePositions")
    .values(invoicePosition)
    .returningAll()
    .executeTakeFirstOrThrow();
});
