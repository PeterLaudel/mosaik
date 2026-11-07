import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";
import { serviceFactory } from "./services";

type ServiceAmountRow = Database["serviceAmounts"];
type ServiceAmountBuild = Omit<Insertable<ServiceAmountRow>, "id" | "serviceId"> & {
  serviceId?: number;
};
type ServiceAmountCreated = Selectable<ServiceAmountRow>;

export const serviceAmountFactory = Factory.define<
  ServiceAmountBuild,
  unknown,
  ServiceAmountCreated
>(() => ({
  factor: "1.0",
  price: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
})).onCreate(async (attrs) => {
  let { serviceId } = attrs;
  if (serviceId === undefined) {
    const service = await serviceFactory.create();
    serviceId = service.id;
  }
  const db = getDb();
  return db
    .insertInto("serviceAmounts")
    .values({ ...attrs, serviceId })
    .returningAll()
    .executeTakeFirstOrThrow();
});
