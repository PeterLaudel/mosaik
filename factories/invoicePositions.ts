import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";
import { invoiceFactory } from "./invoices";
import { serviceFactory } from "./services";

type InvoicePositionRow = Database["invoicePositions"];
type InvoicePositionBuild = Omit<Insertable<InvoicePositionRow>, "id" | "invoiceId" | "serviceId"> & {
  invoiceId?: number;
  serviceId?: number;
};
type InvoicePositionCreated = Selectable<InvoicePositionRow>;

export const invoicePositionFactory = Factory.define<
  InvoicePositionBuild,
  unknown,
  InvoicePositionCreated
>(() => ({
  serviceDate: faker.date.birthdate().toISOString().split("T")[0],
  amount: faker.number.int({ min: 1, max: 5 }),
  factor: faker.helpers.arrayElement(["1.0", "1.8", "2.3"] as const),
  price: faker.number.float({ min: 100, max: 200 }),
})).onCreate(async (attrs) => {
  let { invoiceId, serviceId } = attrs;
  if (invoiceId === undefined) {
    const invoice = await invoiceFactory.create();
    invoiceId = invoice.id;
  }
  if (serviceId === undefined) {
    const service = await serviceFactory.create();
    serviceId = service.id;
  }
  const db = getDb();
  return db
    .insertInto("invoicePositions")
    .values({ ...attrs, invoiceId, serviceId })
    .returningAll()
    .executeTakeFirstOrThrow();
});
