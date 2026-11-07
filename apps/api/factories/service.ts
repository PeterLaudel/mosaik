import { Factory } from "fishery";
import { getDb } from "../src/initialize";
import type { Service } from "@mosaik/contract/models/service";

export const serviceFactory = Factory.define<
  Omit<Service, "id">,
  unknown,
  Service
>(({ sequence }) => ({
  short: `Short ${sequence}`,
  originalGopNr: `OriginalGopNr ${sequence}`,
  description: `Description ${sequence}`,
  note: `Note ${sequence}`,
  points: sequence,
  amounts: [
    {
      factor: "1.0",
      price: sequence,
    },
    {
      factor: "1.8",
      price: sequence + 1,
    },
    {
      factor: "2.3",
      price: sequence + 2,
    },
  ],
})).onCreate(async ({ amounts, ...rest }) => {
  const db = getDb();
  const createdService = await db
    .insertInto("services")
    .values(rest)
    .returningAll()
    .executeTakeFirstOrThrow();

  const serviceAmounts = await Promise.all(
    amounts.map(async (amount) => {
      return await db
        .insertInto("serviceAmounts")
        .values({
          serviceId: createdService.id,
          factor: amount.factor,
          price: amount.price,
        })
        .returning(["factor", "price"])
        .executeTakeFirstOrThrow();
    })
  );

  return {
    ...createdService,
    amounts: serviceAmounts,
  };
});
