import { Factory } from "fishery";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";

type ServiceRow = Database["services"];
type ServiceBuild = Omit<Insertable<ServiceRow>, "id">;
type ServiceCreated = Selectable<ServiceRow>;

// Inserts only the services row. Prices live in serviceAmounts; create them with
// serviceAmountFactory when a test needs them.
export const serviceFactory = Factory.define<ServiceBuild, unknown, ServiceCreated>(({ sequence }) => ({
  short: `Short ${sequence}`,
  originalGopNr: `OriginalGopNr ${sequence}`,
  description: `Description ${sequence}`,
  note: `Note ${sequence}`,
  points: sequence,
})).onCreate(async (attrs) => {
  const db = getDb();
  return db.insertInto("services").values(attrs).returningAll().executeTakeFirstOrThrow();
});
