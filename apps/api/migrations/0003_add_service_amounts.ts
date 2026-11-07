import { Kysely } from "kysely";
import { addIdColumn } from "./_helpers";

export async function up(kysely: Kysely<unknown>) {
  await addIdColumn(
    kysely,
    kysely.schema
      .createTable("serviceAmounts")
      .addColumn("serviceId", "integer", (col) =>
        col.references("services.id").onDelete("cascade").notNull(),
      )
      .addColumn("factor", "text", (col) => col.notNull())
      .addColumn("price", "real", (col) => col.notNull()),
  ).execute();
}

export function down(kysely: Kysely<unknown>) {
  return kysely.schema.dropTable("serviceAmounts").execute();
}
