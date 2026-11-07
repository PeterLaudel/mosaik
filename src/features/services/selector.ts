import { type Database } from "@/initialize";
import { Expression } from "kysely";
import { jsonArrayFrom } from "@/database";

export function serviceSelector(database: Database) {
  return database
    .selectFrom("services")
    .select(({ ref }) => [
      "id",
      "description",
      "note",
      "originalGopNr",
      "points",
      "short",
      amounts(ref("services.id"), database).as("amounts"),
    ]);
}

function amounts(ref: Expression<number>, database: Database) {
  return jsonArrayFrom(
    database
      .selectFrom("serviceAmounts")
      .select(["factor", "price"])
      .whereRef(ref, "=", "serviceId")
  );
}
